const childProcess = require('child_process')
const EventEmitter = require('events')
const path = require('path')
const Joi = require('joi')

const {
	fromMessage,
	CommandGetTime,
	CommandChildStop,
	CommandTimeTravel,
	MessageChildError,
	CommandGetLastMCI,
	CommandGetUnitInfo,
	CommandGetBalanceOf,
	CommandGetUnitProps,
	CommandReadAAStateVars,
} = require('../../messages')

class AbstractNode extends EventEmitter {
	constructor (params, schema, options = {}) {
		super()
		this.setMaxListeners(100)
		this.isReady = false
		this.aaResponses = {
			toUnit: {},
		}

		this.receivedUnits = []

		const { error, value } = Joi.validate(
			params,
			(schema instanceof Function) ? schema() : schema,
			options,
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
			stdio: ['pipe', 'ignore', 'inherit', 'ipc'],
			cwd: path.join(dirname, '/child'),
			env: {
				devnet: 1,
				LOCALAPPDATA: path.join(this.rundir, this.id),
				HOME: path.join(this.rundir, this.id),
				...env,
			},
		}

		this.child = childProcess.fork('index.js', argv, options)
			.on('exit', this.handleChildExit.bind(this))
			.on('error', this.handleChildError.bind(this))
			.on('message', this.handleChildMessage.bind(this))
			.setMaxListeners(20)

		this
			.on('child_ready', () => this.handleChildReady())
			.on('aa_response', (m) => this.handleAaResponse(m))
			.on('child_error', (m) => this.handleChildError(m.error))
			.on('new_joint', ({ joint }) => this.receivedUnits.push(joint.unit.unit))
	}

	async stop () {
		return new Promise((resolve) => {
			this.child.once('exit', () => {
				resolve(this)
			})
			this.sendToChild(new CommandChildStop())
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

	waitForUnit (unit) {
		return new Promise(resolve => {
			if (this.receivedUnits.includes(unit)) {
				resolve()
			} else {
				const cb = ({ joint }) => {
					if (joint.unit.unit === unit) {
						this.removeListener('new_joint', cb)
						resolve()
					}
				}
				this.on('new_joint', cb)
			}
		})
	}

	waitForNewJoint () {
		return new Promise(resolve => {
			this.once('new_joint', ({ joint }) => {
				resolve(joint)
			})
		})
	}

	async timetravel ({ to, shift } = {}) {
		return new Promise(resolve => {
			this.once('time_travel_done', (m) => {
				resolve({ error: m.error })
			})
			this.sendToChild(new CommandTimeTravel({ to, shift }))
		})
	}

	handleChildReady () {
		console.log(`[INFO][${this.id}] Child started`)
		this.isReady = true
	}

	handleAaResponse (m) {
		// console.log(`[INFO][${this.id}] handleAaResponse`, JSON.stringify(m, null, 2))
		this.aaResponses.toUnit[m.response.trigger_unit] = m.response
		this.emit('aa_response_to_unit-' + m.response.trigger_unit, { response: m.response })
		this.emit('aa_response_to_address-' + m.response.trigger_address, { response: m.response })
		this.emit('aa_response_from_aa-' + m.response.aa_address, { response: m.response })
	}

	async readAAStateVars (address) {
		this.sendToChild(new CommandReadAAStateVars({ address }))
		return new Promise((resolve) => {
			this.once('aa_state_vars', m => resolve({ vars: m.vars }))
		})
	}

	getAaResponseToUnit (unit) {
		return this.aaResponses.toUnit[unit]
	}

	async getUnitInfo ({ unit }) {
		return new Promise(resolve => {
			this.once('unit_info', (m) => {
				resolve({ unitObj: m.unitObj, error: m.error })
			})
			this.sendToChild(new CommandGetUnitInfo({ unit }))
		})
	}

	async getUnitProps ({ unit }) {
		return new Promise(resolve => {
			this.once('unit_props', (m) => {
				resolve({ unitProps: m.unitProps })
			})
			this.sendToChild(new CommandGetUnitProps({ unit }))
		})
	}

	async getTime () {
		return new Promise(resolve => {
			this.once('current_time', (m) => {
				resolve({ time: m.time })
			})
			this.sendToChild(new CommandGetTime())
		})
	}

	async getLastMCI () {
		return new Promise(resolve => {
			this.once('last_mci', (m) => {
				resolve(m.mci)
			})
			this.sendToChild(new CommandGetLastMCI())
		})
	}

	async getBalanceOf (address) {
		return new Promise(resolve => {
			this.once('balance_of', (m) => {
				resolve(m.balance)
			})
			this.sendToChild(new CommandGetBalanceOf({ address }))
		})
	}

	sendToChild (message) {
		this.child.send(message.serialize())
	}

	handleChildError (e) {
		console.log(`[ERROR][${this.id}]`, e)
	}

	handleChildExit () {
		console.log(`[INFO][${this.id}] Child exited`)
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
