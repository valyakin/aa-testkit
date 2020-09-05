const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageCustom,
	MessageChildReady,
	MessagePasswordRequired,
} = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	isSingleAddress: Joi.boolean().required(),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class CustomNodeChild extends AbstractChild {
	constructor (argv) {
		const params = CustomNodeChild.unpackArgv(argv)
		super(params, paramsSchema)
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
			genesisUnit,
			isSingleAddress,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
			hub,
			genesisUnit,
			isSingleAddress,
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

		this.myWitnesses = require('ocore/my_witnesses')
		this.myWitnesses.insertWitnesses(this.initialWitnesses)

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub
		this.conf.bSingleAddress = this.isSingleAddress

		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')

		this.composer = require('ocore/composer')
		this.network = require('ocore/network')
		this.storage = require('ocore/storage')
		this.desktopApp = require('ocore/desktop_app.js')

		if (process.env.mnemonic) {
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

		this.on('command_custom', (m) => this.handleCustomCommand(m.payload))
		this.run()
	}

	run () {
		throw new Error('CustomNode run method must be implemented')
	}

	handleCustomCommand (payload) {
		// handle custom commands here
	}

	sendCustomMessage (payload) {
		this.sendToParent(new MessageCustom({ payload }))
	}
}

module.exports = CustomNodeChild
