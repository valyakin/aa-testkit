require('../../../../require')
const mockdate = require('mockdate')
const EventEmitter = require('events')
const Joi = require('joi')
const fs = require('fs')
const { fromMessage, MessageChildStarted, MessageMciBecameStable, MessageTimeTravelDone } = requireRoot('src/messages')

class AbstractChild extends EventEmitter {
	constructor (params, paramsSchema, options) {
		console.log('Date :', new Date())
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

		const eventBus = require('ocore/event_bus')
		eventBus.on('mci_became_stable', () => setTimeout(() => this.sendParent(new MessageMciBecameStable()), 100))
	}

	static unpackArgv (argv) {
		throw new Error('Abstarct `unpackArgv` implementation used')
	}

	start () {
		this.sendParent(new MessageChildStarted())
	}

	stop () {
		console.log('Received command to stop')
		setTimeout(() => {
			process.exit()
		}, 100)
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

	timeTravel ({ to }) {
		mockdate.set(to)
		this.sendParent(new MessageTimeTravelDone())
	}
}

module.exports = AbstractChild
