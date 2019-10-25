const fs = require('fs')
const util = require('util')
const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const { MessageChildReady } = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class ObyteHubChild extends AbstractChild {
	constructor (argv) {
		const params = ObyteHubChild.unpackArgv(argv)
		super(params, paramsSchema)
	}

	static unpackArgv (argv) {
		const [,,
			id,
			genesisUnit,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
			genesisUnit,
			initialWitnesses,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.conf = require('ocore/conf.js')
		this.conf.initial_witnesses = this.initialWitnesses

		this.hub = require('obyte-hub')

		this.replaceConsoleLog().then(() => this.sendParent(new MessageChildReady()))
	}

	replaceConsoleLog () {
		return new Promise(resolve => {
			const desktopApp = require('ocore/desktop_app.js')
			const appDataDir = desktopApp.getAppDataDir()
			const logFilename = this.conf.LOG_FILENAME || (appDataDir + '/log.txt')
			const writeStream = fs.createWriteStream(logFilename)
			console.log('---------------')
			console.log('From this point, output will be redirected to ' + logFilename)
			console.log = function () {
				writeStream.write(Date().toString() + ': ')
				writeStream.write(util.format.apply(null, arguments) + '\n')
			}
			console.warn = console.log
			console.info = console.log
			setTimeout(resolve, 1000)
		})
	}
}

const child = new ObyteHubChild(process.argv)
child.start()
