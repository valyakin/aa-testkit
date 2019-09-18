const childProcess = require('child_process')
const EventEmitter = require('events')
const config = require('config')
const uniqid = require('uniqid')
const path = require('path')
const Joi = require('joi')

const paramsSchemaFactory = () => ({
	id: Joi.string().default(uniqid('obyte-explorer-')),
	silent: Joi.boolean().default(false),
	passphrase: Joi.string().default(config.DEFAULT_PASSPHRASE),
	childHome: Joi.string().default(config.TEST_RUN_HOME),
	genesisUnit: Joi.string().default(config.GENESIS_UNIT),
})

class ObyteExplorer extends EventEmitter {
	constructor (params = {}) {
		super()
		this.setMaxListeners(20)

		const { error, value } = Joi.validate(params, paramsSchemaFactory(), {})
		if (error) throw new Error(`${error}`)
		Object.assign(this, value)

		const args = [
			this.id,
			this.genesisUnit,
		]

		const options = {
			stdio: ['pipe', this.silent ? 'ignore' : 'inherit', 'inherit', 'ipc'],
			cwd: path.join(__dirname, '/node'),
			env: {
				devnet: 1,
				HOME: path.join(this.childHome, this.id),
			},
		}

		this.node = childProcess.fork('index.js', args, options)

		this.node.on('error', this.handleError.bind(this))
		this.node.on('message', this.handleMessage.bind(this))
	}

	handleError (e) {
		console.log(`Error in ${this.id}`, e)
	}

	handleMessage (message) {
		// console.log('message', JSON.stringify(message, null, 2))
		switch (message.topic) {
		case 'started':
			this.emit('started')
			break
		case 'password_required':
			setTimeout(() => {
				this.node.stdin.write(this.passphrase + '\n')
			}, 2000)
			break
		default:
			throw new Error('Unsupported message topic', message.topic)
		}
	}
}

module.exports = ObyteExplorer
