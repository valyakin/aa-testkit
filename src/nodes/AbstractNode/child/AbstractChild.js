require('../../../../require')
const EventEmitter = require('events')
const Joi = require('joi')
const fs = require('fs')
const { fromMessage, MessageChildStarted, MessageMciBecameStable } = requireRoot('src/messages')

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
		process.send(message.serialize())
	}

	handleParentMessage (m) {
		console.log('message', JSON.stringify(m, null, 2))
		const message = fromMessage(m)
		this.emit(message.topic, message)
	}
}

module.exports = AbstractChild
