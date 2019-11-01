const mockdate = require('mockdate')
const EventEmitter = require('events')
const Joi = require('joi')
const util = require('util')
const fs = require('fs')
const {
	fromMessage,
	MessageUnitInfo,
	MessageChildStarted,
	MessageTimeTravelDone,
	MessageMciBecameStable,
} = require('../../../messages')

class AbstractChild extends EventEmitter {
	constructor (params, paramsSchema, options) {
		super()
		this.setMaxListeners(20)

		const { error, value } = Joi.validate(
			params,
			(paramsSchema instanceof Function) ? paramsSchema() : paramsSchema,
			options
		)
		if (error) throw new Error(`[${this.constructor.name}][${params.id}] ${error}`)
		Object.assign(this, value)

		fs.mkdirSync(process.env.HOME, { recursive: true })
		const conf = require('ocore/conf.js')
		conf.deviceName = this.id

		process
			.on('message', this.handleParentMessage.bind(this))
			.setMaxListeners(20)

		this
			.on('command_child_stop', () => this.stop())
			.on('command_time_travel', (m) => this.timeTravel(m))
			.on('command_get_unit_info', (m) => this.getUnitInfo(m))

		const eventBus = require('ocore/event_bus')
		eventBus.on('mci_became_stable', () => setTimeout(() => this.sendParent(new MessageMciBecameStable()), 100))
	}

	static unpackArgv (argv) {
		throw new Error('Abstarct `unpackArgv` implementation used')
	}

	start () {
		this.replaceConsoleLog()
		this.sendParent(new MessageChildStarted())
	}

	stop () {
		console.log('Received command to stop')
		setTimeout(() => {
			process.exit()
		}, 100)
	}

	timeTravel ({ to }) {
		mockdate.set(to)
		this.sendParent(new MessageTimeTravelDone())
	}

	getUnitInfo ({ unit }) {
		const db = require('ocore/db')
		const { readJoint } = require('ocore/storage')
		readJoint(db, unit, {
			ifNotFound: () => {
				this.sendParent(new MessageUnitInfo({ unitObj: null, error: 'Unit not found' }))
			},
			ifFound: (objJoint) => {
				this.sendParent(new MessageUnitInfo({ unitObj: objJoint, error: null }))
			},
		})
	}

	sendParent (message) {
		console.log('sendParent', JSON.stringify(message.serialize(), null, 2))
		setTimeout(() => process.send(message.serialize()), 100)
	}

	handleParentMessage (m) {
		console.log('handleParentMessage', JSON.stringify(m, null, 2))
		const message = fromMessage(m)
		this.emit(message.topic, message)
	}

	replaceConsoleLog () {
		const desktopApp = require('ocore/desktop_app.js')
		const conf = require('ocore/conf.js')
		const appDataDir = desktopApp.getAppDataDir()
		fs.mkdirSync(appDataDir, { recursive: true })

		const logFilename = conf.LOG_FILENAME || (appDataDir + '/log.txt')
		const writeStream = fs.createWriteStream(logFilename, { flags: 'a' })
		console.log = (...args) => {
			writeStream.write(this.logPrefix())
			writeStream.write(util.format.apply(null, args) + '\n')
		}
		console.error = console.log
		console.warn = console.log
		console.info = console.log
	}

	logPrefix () {
		return Date().toString() + ': '
	}
}

module.exports = AbstractChild
