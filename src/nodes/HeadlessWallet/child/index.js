const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageSentData,
	MessageSentMulti,
	MessageSentBytes,
	MessageMyAddress,
	MessageMyBalance,
	MessageChildReady,
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

		this.sendParent(new MessagePasswordRequired())
		this.eventBus.once('headless_wallet_ready', () => {
			setTimeout(() => this.sendParent(new MessageChildReady()), 1000)
		})
	}

	getAddress () {
		this.headlessWallet.readFirstAddress(address => {
			this.sendParent(new MessageMyAddress({ address }))
		})
	}

	sendBytes ({ toAddress, amount }) {
		this.headlessWallet.issueChangeAddressAndSendPayment(null, amount, toAddress, null, (err, unit) => {
			if (err) {
				this.sendParent(new MessageSentBytes({ error: err }))
			} else {
				this.sendParent(new MessageSentBytes({ unit }))
			}
		})
	}

	sendMulti ({ opts }) {
		this.headlessWallet.issueChangeAddressAndSendMultiPayment(opts, (err, unit) => {
			if (err) {
				this.sendParent(new MessageSentMulti({ error: err }))
			}
			this.sendParent(new MessageSentMulti({ unit }))
		})
	}

	sendData (message) {
		const { payload, toAddress, amount } = message
		this.headlessWallet.readFirstAddress(firstAddress => {
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
				paying_addresses: [firstAddress],
				to_address: toAddress,
				amount,
				messages,
			}

			this.headlessWallet.issueChangeAddressAndSendMultiPayment(opts, (err, unit) => {
				if (err) {
					this.sendParent(new MessageSentData({ error: err }))
				}
				this.sendParent(new MessageSentData({ unit }))
			})
		})
	}

	getBalance () {
		this.headlessWallet.readSingleWallet(walletId => {
			const wallet = require('ocore/wallet')
			wallet.readBalance(walletId, (assocBalances) => {
				console.log('assocBalances', assocBalances)
				this.sendParent(new MessageMyBalance({ balance: assocBalances }))
			})
		})
	}
}

const child = new HeadlessWalletChild(process.argv)
child.start()
