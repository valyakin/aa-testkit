const { ChildrenManager } = require('../../sevices')
const path = require('path')
const Joi = require('joi')
const config = require('config')['aa-testkit']
const AbstractNode = require('../AbstractNode/AbstractNode')
const {
	CommandCustom,
} = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	passphrase: Joi.string().default('0000'),
	hub: Joi.string().default(`localhost:${config.NETWORK_PORT}`),
	isSingleAddress: Joi.string().default(config.WALLETS_ARE_SINGLE_ADDRESS),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
	mnemonic: Joi.string().default(null),
})

class CustomNode extends AbstractNode {
	constructor (params = {}) {
		super(params, schemaFactory)
		this.runChild(__dirname,
			this.mnemonic
				? {
					mnemonic: this.mnemonic,
					passphrase: this.passphrase,
				}
				: {},
		)

		this
			.on('password_required', () => this.sendPassword())
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
			execArgv: [],
		}

		this.child = ChildrenManager.fork(this.childPath(), argv, options)
			.on('exit', this.handleChildExit.bind(this))
			.on('error', this.handleChildError.bind(this))
			.on('message', this.handleChildMessage.bind(this))
			.setMaxListeners(20)

		this
			.on('child_ready', () => this.handleChildReady())
			.on('aa_response', (m) => this.handleAaResponse(m))
			.on('child_error', (m) => this.handleChildError(m.error))
			.on('new_joint', ({ joint }) => this.receivedUnits.push(joint.unit.unit))
			.on('saved_unit', ({ joint }) => this.receivedUnits.push(joint.unit.unit))
			.on('custom', (m) => this.handleCustomMessage(m.payload))
	}

	packArgv () {
		return [
			this.id,
			this.hub,
			this.genesisUnit,
			this.isSingleAddress,
			this.initialWitnesses.length,
			...this.initialWitnesses,
		]
	}

	childPath () {
		throw new Error('ChildNode childPath method must be implemented')
	}

	handleCustomMessage (payload) {
		// handle custom messages from child here
	}

	sendCustomCommand (payload) {
		this.sendToChild(new CommandCustom({ payload }))
	}

	sendPassword () {
		this.child.stdin.write(this.passphrase + '\n')
	}
}

module.exports = CustomNode
