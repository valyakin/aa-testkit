const Joi = require('joi')
const config = require('config')['aa-testkit']
const AbstractNode = require('../AbstractNode/AbstractNode')
const {
	CommandSendData,
	CommandSendBytes,
	CommandSendMulti,
	CommandGetAddress,
	CommandGetBalance,
} = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	silent: Joi.boolean().default(true),
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
}

module.exports = HeadlessWallet
