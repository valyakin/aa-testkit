const Joi = require('joi')
const AbstractNode = require('../AbstractNode/AbstractNode')
const { CommandGetAddress, CommandGetBalance, CommandDeployAgent, CommandReadAAStateVars } = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	silent: Joi.boolean().default(true),
	passphrase: Joi.string().required(),
	genesisUnit: Joi.string().required(),
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
			this.genesisUnit,
		]
	}

	sendPassword () {
		setTimeout(() => {
			this.child.stdin.write(this.passphrase + '\n')
		}, 2000)
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
			this.once('agent_deployed', m => resolve({ address: m.address, unit: m.unit }))
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
