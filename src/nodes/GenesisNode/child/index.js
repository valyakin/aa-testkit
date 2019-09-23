const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const { MessagePasswordRequired, MessageChildError, MessageGenesisCreated, MessageChildReady } = requireRoot('src/messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
})

class GenesisNodeChild extends AbstractChild {
	constructor (argv) {
		const params = GenesisNodeChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_login_to_hub', () => this.loginToHub())
			.on('command_send_bytes', (m) => this.sendBytes(m))
	}

	static unpackArgv (argv) {
		const [,,
			id,
		] = argv

		return {
			id,
		}
	}

	start () {
		super.start()
		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')
		this.device = require('ocore/device.js')
		this.db = require('ocore/db.js')
		this.constants = require('ocore/constants.js')

		this.sendParent(new MessagePasswordRequired())
		this.eventBus.once('headless_wallet_ready', () => this.genesis())
	}

	loginToHub () {
		this.device.loginToHub()
	}

	sendBytes ({ toAddress, amount }) {
		this.headlessWallet.issueChangeAddressAndSendPayment(null, amount, toAddress, null, (err, unit) => {
			console.log('err, unit', err, unit)
			if (err) {
				this.sendParent(new MessageChildError({ error: err }))
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

			this.sendParent(new MessageGenesisCreated({ address, genesisUnit: genesisHash }))

			//
			//
			this.constants.initial_witnesses = [address]
			require('obyte-witness')
			this.sendParent(new MessageChildReady())
		} catch (error) {
			this.sendParent(new MessageChildError(error))
		}
	}

	addMyWitness (witness) {
		return new Promise((resolve) => {
			this.db.query('INSERT INTO my_witnesses (address) VALUES (?)', [witness], resolve)
		})
	}

	createGenesisUnit (witness) {
		return new Promise((resolve, reject) => {
			var composer = require('ocore/composer.js')
			var network = require('ocore/network.js')

			var savingCallbacks = composer.getSavingCallbacks({
				ifNotEnoughFunds: reject,
				ifError: reject,
				ifOk: function (objJoint) {
					network.broadcastJoint(objJoint)
					resolve(objJoint.unit.unit)
				},
			})

			composer.setGenesis(true)
			composer.composeJoint({
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
}

const child = new GenesisNodeChild(process.argv)
child.start()
