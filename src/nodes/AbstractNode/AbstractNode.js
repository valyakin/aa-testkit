const childProcess = require('child_process')
const EventEmitter = require('events')
const path = require('path')
const Joi = require('joi')

const { fromMessage, MessageChildError, CommandChildStop, CommandTimeTravel } = requireRoot('src/messages')

class AbstractNode extends EventEmitter {
	constructor (params, schema, options = {}) {
		super()
		this.setMaxListeners(20)
		this.isReady = false

		const { error, value } = Joi.validate(
			params,
			(schema instanceof Function) ? schema() : schema,
			options
		)
		if (error) throw new Error(`[${this.constructor.name}][${params.id}] ${error}`)
		Object.assign(this, value)
	}

	packArgv () {
		throw new Error('Abstarct `packArgv` implementation used')
	}

	runChild (dirname, env) {
		const argv = this.packArgv()

		const options = {
			stdio: ['pipe', this.silent ? 'ignore' : 'inherit', 'inherit', 'ipc'],
			cwd: path.join(dirname, '/child'),
			env: {
				devnet: 1,
				HOME: path.join(this.rundir, this.id),
				...env,
			},
		}

		this.child = childProcess.fork('index.js', argv, options)
			.on('error', this.handleChildError.bind(this))
			.on('message', this.handleChildMessage.bind(this))
			.setMaxListeners(20)

		this
			.on('child_ready', () => { this.isReady = true })
	}

	async stop () {
		return new Promise((resolve) => {
			this.child.once('exit', () => {
				resolve(this)
			})
			this.sendChild(new CommandChildStop())
		})
	}

	async ready () {
		if (this.isReady) return this
		return new Promise((resolve) => {
			this.once('child_ready', () => {
				this.isReady = true
				resolve(this)
			})
		})
	}

	async stabilize () {
		return new Promise(resolve => {
			this.once('mci_became_stable', () => {
				resolve(this)
			})
		})
	}

	async timeTravel ({ to }) {
		return new Promise(resolve => {
			this.once('time_travel_done', () => {
				resolve(this)
			})
			this.sendChild(new CommandTimeTravel({ to }))
		})
	}

	sendChild (message) {
		this.child.send(message.serialize())
	}

	handleChildError (e) {
		console.log(`[Error][${this.id}]`, e)
	}

	handleChildMessage (m) {
		const message = fromMessage(m)

		this.emit(message.topic, message)
		if (message instanceof MessageChildError) {
			this.handleChildError(message.error)
		}
	}
}

module.exports = AbstractNode
