const mockdate = require('mockdate')
const EventEmitter = require('events')
const Joi = require('joi')
const util = require('util')
const fs = require('fs')
const { isString } = require('lodash')
const {
	fromMessage,
	MessageUnitInfo,
	MessageCurrentTime,
	MessageAAStateVars,
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
			.on('command_get_time', (m) => this.getTime(m))
			.on('command_time_travel', (m) => this.timetravel(m))
			.on('command_get_unit_info', (m) => this.getUnitInfo(m))
			.on('command_read_aa_state_vars', (m) => this.readAAStateVars(m))

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
		process.exit()
	}

	timetravel ({ to, shift }) {
		const currentDate = Date.now()

		try {
			const newDate = to
				? new Date(to)
				: currentDate + this.shiftToMs(shift)

			if (newDate < currentDate) {
				throw new Error('Attempt to timetravel in past')
			}
			mockdate.set(newDate)
			this.sendParent(new MessageTimeTravelDone({ error: null }))
		} catch (error) {
			this.sendParent(new MessageTimeTravelDone({ error: error.message }))
		}
	}

	shiftToMs (shift) {
		if (Number.isInteger(shift)) {
			return shift
		} else if (isString(shift)) {
			const match = shift.match(/^(\d+)([smhd])$/)
			if (match) {
				const number = Number(match[1])
				const duration = match[2]
				switch (duration) {
				case 's':
					return number * 1000
				case 'm':
					return number * 1000 * 60
				case 'h':
					return number * 1000 * 60 * 60
				case 'd':
					return number * 1000 * 60 * 60 * 24
				}
			} else {
				throw new Error(`Unsupported 'shift' format '${shift}'`)
			}
		}
		return 0
	}

	getTime () {
		this.sendParent(new MessageCurrentTime({ time: Date.now() }))
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

	async readAAStateVars ({ address }) {
		const vars = await this.getAAStateVarsFromStorage(address)
		this.sendParent(new MessageAAStateVars({ vars }))
	}

	getAAStateVarsFromStorage (address) {
		return new Promise(resolve => {
			const storage = require('ocore/storage')
			storage.readAAStateVars(address, (vars) => {
				resolve(vars)
			})
		})
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
