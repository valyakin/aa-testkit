const Joi = require('joi')
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
	passphrase: Joi.string().required(),
	genesisUnit: Joi.string().required(),
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

	async sendMulti (opts) {
		return new Promise(resolve => {
			this.once('sent_multi', (m) => resolve(m.unit))
			this.sendChild(new CommandSendMulti(opts))
		})
	}

	async sendData ({ toAddress, amount, payload }) {
		return new Promise(resolve => {
			this.once('sent_data', (m) => resolve(m.unit))
			this.sendChild(new CommandSendData({ toAddress, amount, payload }))
		})
	}

	async sendBytes ({ toAddress, amount }) {
		return new Promise(resolve => {
			this.once('sent_bytes', (m) => resolve(m.unit))
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
