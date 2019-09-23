require('../../../../require')
const EventEmitter = require('events')
const Joi = require('joi')
const fs = require('fs')
const { fromMessage, MessageChildStarted } = requireRoot('src/messages')

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
	}

	static unpackArgv (argv) {
		throw new Error('Abstarct `unpackArgv` implementation used')
	}

	start () {
		this.sendParent(new MessageChildStarted())
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
