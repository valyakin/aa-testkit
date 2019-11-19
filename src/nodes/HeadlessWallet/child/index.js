const Joi = require('joi')
const { isString } = require('lodash')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageSentData,
	MessageSentMulti,
	MessageSentBytes,
	MessageMyAddress,
	MessageMyBalance,
	MessageChildReady,
	MessageAgentDeployed,
	MessagePasswordRequired,
} = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
	genesisUnit: Joi.string().required(),
})

class HeadlessWalletChild extends AbstractChild {
	constructor (argv) {
		const params = HeadlessWalletChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_send_data', (m) => this.sendData(m))
			.on('command_send_multi', (m) => this.sendMulti(m))
			.on('command_get_address', () => this.getAddress())
			.on('command_send_bytes', (m) => this.sendBytes(m))
			.on('command_get_balance', (m) => this.getBalance(m))
			.on('command_deploy_agent', (m) => this.deployAgent(m))
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
			genesisUnit,
		] = argv

		return {
			id,
			hub,
			genesisUnit,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub

		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')

		this.composer = require('ocore/composer')
		this.network = require('ocore/network')
		this.storage = require('ocore/storage')

		this.eventBus.once('headless_wallet_need_pass', () => {
			this.sendToParent(new MessagePasswordRequired())
		})

		this.eventBus.once('headless_wallet_ready', () => {
			this.sendToParent(new MessageChildReady())
		})
	}

	getAddress () {
		this.headlessWallet.readFirstAddress(address => {
			this.sendToParent(new MessageMyAddress({ address }))
		})
	}

	sendBytes ({ toAddress, amount }) {
		this.headlessWallet.issueChangeAddressAndSendPayment(null, amount, toAddress, null, (err, unit) => {
			if (err) {
				this.sendToParent(new MessageSentBytes({ error: err }))
			} else {
				this.sendToParent(new MessageSentBytes({ unit, error: null }))
			}
		})
	}

	sendMulti ({ opts }) {
		this.headlessWallet.issueChangeAddressAndSendMultiPayment(opts, (err, unit) => {
			if (err) {
				this.sendToParent(new MessageSentMulti({
					unit: null,
					...(isString(err) ? { error: err } : err),
				}))
			}
			this.sendToParent(new MessageSentMulti({ unit, error: null }))
		})
	}

	sendData ({ payload, toAddress, amount }) {
		const objectHash = require('ocore/object_hash.js')

		const messages = [
			{
				app: 'data',
				payload_location: 'inline',
				payload_hash: objectHash.getBase64Hash(payload),
				payload: payload,
			},
		]
		const opts = {
			to_address: toAddress,
			amount,
			messages,
		}

		this.headlessWallet.issueChangeAddressAndSendMultiPayment(opts, (err, unit) => {
			if (err) {
				this.sendToParent(new MessageSentData({
					unit: null,
					...(isString(err) ? { error: err } : err),
				}))
			}
			this.sendToParent(new MessageSentData({ unit, error: null }))
		})
	}

	getBalance () {
		this.headlessWallet.readSingleWallet(walletId => {
			const wallet = require('ocore/wallet')
			wallet.readBalance(walletId, (assocBalances) => {
				this.sendToParent(new MessageMyBalance({ balance: assocBalances }))
			})
		})
	}

	async deployAgent ({ ojson }) {
		try {
			const objectHash = require('ocore/object_hash')
			const aaAddress = objectHash.getChash160(ojson)

			const myAddress = await new Promise((resolve, reject) => {
				this.headlessWallet.readFirstAddress(address => resolve(address))
			})

			const payload = {
				address: aaAddress,
				definition: ojson,
			}

			const callbacks = this.composer.getSavingCallbacks({
				ifNotEnoughFunds: (err) => this.sendToParent(new MessageAgentDeployed({ error: err })),
				ifError: (err) => this.sendToParent(new MessageAgentDeployed({ error: err })),
				ifOk: (objJoint) => {
					this.network.broadcastJoint(objJoint)
					this.sendToParent(new MessageAgentDeployed({ unit: objJoint.unit.unit, address: aaAddress, error: null }))
				},
			})

			this.composeContentJoint(myAddress, 'definition', payload, this.headlessWallet.signer, callbacks)
		} catch (error) {
			this.sendToParent(new MessageAgentDeployed({ error: error.message }))
		}
	}

	composeContentJoint (fromAddress, app, payload, signer, callbacks) {
		const objectHash = require('ocore/object_hash')

		const objMessage = {
			app: app,
			payload_location: 'inline',
			payload_hash: objectHash.getBase64Hash(payload),
			payload: payload,
		}
		this.composer.composeJoint({
			paying_addresses: [fromAddress],
			outputs: [{ address: fromAddress, amount: 0 }],
			messages: [objMessage],
			signer: signer,
			callbacks: callbacks,
		})
	}
}

const child = new HeadlessWalletChild(process.argv)
child.start()
