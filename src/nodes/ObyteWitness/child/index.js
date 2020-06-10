const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageChildReady,
	MessagePasswordRequired,
	MessageConnectedToHub,
	MessageMyAddress,
	MessageChildError,
	MessageWitnessPosted,
} = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class ObyteWitnessChild extends AbstractChild {
	constructor (argv) {
		const params = ObyteWitnessChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_get_address', () => this.getAddress())
			.on('command_login_to_hub', () => this.loginToHub())
			.on('command_post_witness', () => this.postWitness())
	}

	loginToHub () {
		this.eventBus.once('connected', () => {
			this.sendToParent(new MessageConnectedToHub())
		})
		this.device.loginToHub()
	}

	getAddress () {
		this.headlessWallet.readSingleAddress(address => {
			this.sendToParent(new MessageMyAddress({ address }))
		})
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
			genesisUnit,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
			hub,
			genesisUnit,
			initialWitnesses,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.constants.COUNT_WITNESSES = this.initialWitnesses.length
		this.constants.MAJORITY_OF_WITNESSES = this.constants.COUNT_WITNESSES % 2 === 0
			? this.constants.COUNT_WITNESSES / 2 + 1
			: Math.ceil(this.constants.COUNT_WITNESSES / 2)

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub

		this.myWitnesses = require('ocore/my_witnesses')
		this.myWitnesses.insertWitnesses(this.initialWitnesses)
		this.conf.hub = this.hub

		this.obyteWitness = require('obyte-witness')
		this.eventBus = require('ocore/event_bus.js')

		this.composer = require('ocore/composer')
		this.network = require('ocore/network')
		this.storage = require('ocore/storage')
		this.desktopApp = require('ocore/desktop_app.js')
		this.device = require('ocore/device.js')

		this.headlessWallet = require('headless-obyte')

		console.log('here1')
		if (process.env.mnemonic) {
			console.log('process.env.mnemonic', process.env.mnemonic)
			const appDataDir = this.desktopApp.getAppDataDir()
			const keysFilename = path.join(appDataDir, 'keys.json')
			const deviceTempPrivKey = crypto.randomBytes(32)
			const devicePrevTempPrivKey = crypto.randomBytes(32)

			const keys = {
				mnemonic_phrase: process.env.mnemonic,
				temp_priv_key: deviceTempPrivKey.toString('base64'),
				prev_temp_priv_key: devicePrevTempPrivKey.toString('base64'),
			}

			fs.writeFileSync(keysFilename, JSON.stringify(keys, null, '\t'), 'utf8')
		}
		this.eventBus.once('headless_wallet_need_pass', () => {
			this.sendToParent(new MessagePasswordRequired())
		})

		this.eventBus.once('headless_wallet_ready', () => {
			this.sendToParent(new MessageChildReady())
		})
	}

	postWitness () {
		const callbacks = this.composer.getSavingCallbacks({
			ifNotEnoughFunds: (err) => this.sendToParent(new MessageChildError(err.error ? err : { error: err })),
			ifError: (err) => this.sendToParent(new MessageChildError(err.error ? err : { error: err })),
			ifOk: (objJoint) => {
				this.network.broadcastJoint(objJoint)
				this.sendToParent(new MessageWitnessPosted({ unit: objJoint.unit.unit }))
			},
		})

		this.headlessWallet.readSingleAddress(address => {
			const datafeed = {
				time: new Date().toString(),
				timestamp: Date.now(),
			}
			this.composer.composeDataFeedJoint(address, datafeed, this.headlessWallet.signer, callbacks)
		})
	}
}

const child = new ObyteWitnessChild(process.argv)
child.start()
