const Joi = require('joi')
const config = require('config')['aa-testkit']
const AbstractNode = require('../AbstractNode/AbstractNode')
const { CommandGetAddress, CommandGetBalance, CommandDeployAgent, CommandReadAAStateVars } = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	silent: Joi.boolean().default(true),
	genesisUnit: Joi.string().required(),
	passphrase: Joi.string().default(config.DEFAULT_PASSPHRASE),
	hub: Joi.string().default(`localhost:${config.NETWORK_PORT}`),
})

class AgentDeployer extends AbstractNode {
	constructor (params = {}) {
		super(params, schemaFactory)
		this.runChild(__dirname)

		this
			.on('password_required', () => this.sendPassword())
	}

	packArgv () {
		return [
			this.id,
			this.hub,
			this.genesisUnit,
		]
	}

	sendPassword () {
		setTimeout(() => {
			this.child.stdin.write(this.passphrase + '\n')
		}, 1500)
	}

	async getAddress () {
		this.sendChild(new CommandGetAddress())
		return new Promise((resolve) => {
			this.once('my_address', m => resolve(m.address))
		})
	}

	async deployAgent (agent) {
		this.sendChild(new CommandDeployAgent({ agent }))
		return new Promise((resolve) => {
			this.once('agent_deployed', m => resolve({ address: m.address, unit: m.unit, error: m.error }))
		})
	}

	async readAAStateVars (address) {
		this.sendChild(new CommandReadAAStateVars({ address }))
		return new Promise((resolve) => {
			this.once('aa_state_vars', m => resolve({ vars: m.vars }))
		})
	}

	getBalance () {
		return new Promise((resolve) => {
			this.once('my_balance', m => resolve(m.balance))
			this.sendChild(new CommandGetBalance())
		})
	}
}

module.exports = AgentDeployer
