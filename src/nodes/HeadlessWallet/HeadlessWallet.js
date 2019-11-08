const fs = require('fs')
const Joi = require('joi')
const path = require('path')
const { promisify } = require('util')
const { isString, isArray } = require('lodash')
const parseOjson = require('ocore/formula/parse_ojson').parse
const config = require('config')['aa-testkit']
const AbstractNode = require('../AbstractNode/AbstractNode')
const {
	CommandSendData,
	CommandSendBytes,
	CommandSendMulti,
	CommandGetAddress,
	CommandGetBalance,
	CommandDeployAgent,
} = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	passphrase: Joi.string().default(config.DEFAULT_PASSPHRASE),
	hub: Joi.string().default(`localhost:${config.NETWORK_PORT}`),
})

class HeadlessWallet extends AbstractNode {
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
		this.child.stdin.write(this.passphrase + '\n')
	}

	async getAddress () {
		this.sendChild(new CommandGetAddress())
		return new Promise((resolve) => {
			this.once('my_address', m => resolve(m.address))
		})
	}

	async sendMulti (opts) {
		return new Promise(resolve => {
			this.once('sent_multi', (m) => resolve({ unit: m.unit, error: m.error }))
			this.sendChild(new CommandSendMulti(opts))
		})
	}

	async sendData ({ toAddress, amount, payload }) {
		return new Promise(resolve => {
			this.once('sent_data', (m) => resolve({ unit: m.unit, error: m.error }))
			this.sendChild(new CommandSendData({ toAddress, amount, payload }))
		})
	}

	async sendBytes ({ toAddress, amount }) {
		return new Promise(resolve => {
			this.once('sent_bytes', (m) => resolve({ unit: m.unit, error: m.error }))
			this.sendChild(new CommandSendBytes({ toAddress, amount }))
		})
	}

	getBalance () {
		return new Promise((resolve) => {
			this.once('my_balance', m => resolve(m.balance))
			this.sendChild(new CommandGetBalance())
		})
	}

	getAgentFromPath (agentPath) {
		if (path.extname(agentPath) === '.js') {
			return require(agentPath)
		} else {
			return fs.readFileSync(agentPath, 'utf8')
		}
	}

	async deployAgent (source) {
		try {
			const agent = isString(source) && fs.existsSync(source)
				? this.getAgentFromPath(source)
				: source

			const ojson = isString(agent)
				? await promisify(parseOjson)(agent)
				: agent

			this.sendChild(new CommandDeployAgent({
				ojson: isArray(ojson)
					? ojson
					: ['autonomous agent', ojson],
			}))

			return new Promise((resolve) => {
				this.once('agent_deployed', m => resolve({ address: m.address, unit: m.unit, error: m.error }))
			})
		} catch (error) {
			return { error: error.message || error }
		}
	}
}

module.exports = HeadlessWallet
