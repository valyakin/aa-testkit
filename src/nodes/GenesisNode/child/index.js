const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageMyAddress,
	MessageSentBytes,
	MessageChildReady,
	MessageChildError,
	MessageWitnessPosted,
	MessageConnectedToHub,
	MessageGenesisCreated,
	MessagePasswordRequired,
} = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
})

class GenesisNodeChild extends AbstractChild {
	constructor (argv) {
		const params = GenesisNodeChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_login_to_hub', () => this.loginToHub())
			.on('command_send_bytes', (m) => this.sendBytes(m))
			.on('command_post_witness', () => this.postWitness())
			.on('command_get_address', (m) => this.getAddress(m))
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
		] = argv

		return {
			id,
			hub,
		}
	}

	start () {
		super.start()

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub

		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')
		this.device = require('ocore/device.js')
		this.db = require('ocore/db.js')
		this.constants = require('ocore/constants.js')
		this.composer = require('ocore/composer.js')
		this.network = require('ocore/network.js')

		this.eventBus.once('headless_wallet_need_pass', () => {
			this.sendToParent(new MessagePasswordRequired())
		})

		this.eventBus.once('headless_wallet_ready', () => this.genesis())
	}

	loginToHub () {
		this.eventBus.once('connected', () => {
			this.sendToParent(new MessageConnectedToHub())
		})
		this.device.loginToHub()
	}

	postWitness () {
		const callbacks = this.composer.getSavingCallbacks({
			ifNotEnoughFunds: (err) => this.sendToParent(new MessageChildError(err)),
			ifError: (err) => this.sendToParent(new MessageChildError(err)),
			ifOk: (objJoint) => {
				this.network.broadcastJoint(objJoint)
				this.sendToParent(new MessageWitnessPosted({ unit: objJoint.unit.unit }))
			},
		})

		const datafeed = {
			time: new Date().toString(),
			timestamp: Date.now(),
		}
		this.composer.composeDataFeedJoint(this.address, datafeed, this.headlessWallet.signer, callbacks)
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

	async genesis () {
		const address = await new Promise((resolve) => {
			this.headlessWallet.readSingleAddress(resolve)
		})

		try {
			const genesisHash = await this.createGenesisUnit(address)
			await this.addMyWitness(address)
			this.composer.setGenesis(false)
			this.address = address

			this.sendToParent(new MessageGenesisCreated({ address, genesisUnit: genesisHash }))

			if (this.network.isCatchingUp()) {
				this.eventBus.once('catching_up_done', () => this.sendToParent(new MessageChildReady()))
			} else {
				this.sendToParent(new MessageChildReady())
			}
		} catch (error) {
			this.sendToParent(new MessageChildError(error))
		}
	}

	addMyWitness (witness) {
		return new Promise((resolve) => {
			this.db.query('INSERT INTO my_witnesses (address) VALUES (?)', [witness], resolve)
		})
	}

	createGenesisUnit (witness) {
		return new Promise((resolve, reject) => {
			const savingCallbacks = this.composer.getSavingCallbacks({
				ifNotEnoughFunds: reject,
				ifError: reject,
				ifOk: (objJoint) => {
					this.network.broadcastJoint(objJoint)
					resolve(objJoint.unit.unit)
				},
			})

			this.composer.setGenesis(true)
			this.composer.composeJoint({
				witnesses: [witness],
				paying_addresses: [witness],
				outputs: [
					{ address: witness, amount: 1000000 },
					{ address: witness, amount: 1000000 },
					{ address: witness, amount: 1000000 },
					{ address: witness, amount: 1000000 },
					{ address: witness, amount: 1000000 },
					{ address: witness, amount: 0 }, // change output
				],
				signer: this.headlessWallet.signer,
				callbacks: {
					ifNotEnoughFunds: reject,
					ifError: reject,
					ifOk: (objJoint, assocPrivatePayloads, composerUnlock) => {
						this.constants.GENESIS_UNIT = objJoint.unit.unit
						savingCallbacks.ifOk(objJoint, assocPrivatePayloads, composerUnlock)
					},
				},
			})
		})
	}

	getAddress () {
		this.headlessWallet.readFirstAddress(address => {
			this.sendToParent(new MessageMyAddress({ address }))
		})
	}
}

const child = new GenesisNodeChild(process.argv)
child.start()
