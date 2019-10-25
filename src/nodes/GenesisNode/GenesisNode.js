const Joi = require('joi')
const { CommandLoginToHub, CommandSendBytes, CommandPostWitness, CommandGetAddress } = require('../../messages')
const AbstractNode = require('../AbstractNode/AbstractNode')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	passphrase: Joi.string().required(),
	silent: Joi.boolean().default(true),
})

class GenesisNode extends AbstractNode {
	constructor (params = {}) {
		super(params, schemaFactory)
		this.runChild(__dirname)

		this
			.on('password_required', () => this.sendPassword())
	}

	packArgv () {
		return [
			this.id,
		]
	}

	createGenesis () {
		return new Promise((resolve) => {
			this.once('genesis_created', (message) => resolve({
				genesisUnit: message.genesisUnit,
				genesisAddress: message.address,
			}))
		})
	}

	async loginToHub () {
		return new Promise(resolve => {
			this.once('connected_to_hub', () => resolve(this))
			this.sendChild(new CommandLoginToHub())
		})
	}

	sendPassword () {
		setTimeout(() => {
			this.child.stdin.write(this.passphrase + '\n')
		}, 2000)
	}

	async sendBytes ({ toAddress, amount }) {
		return new Promise(resolve => {
			this.once('sent_bytes', () => resolve(this))
			this.sendChild(new CommandSendBytes({ toAddress, amount }))
		})
	}

	async postWitness () {
		this.sendChild(new CommandPostWitness())
	}

	async getAddress () {
		this.sendChild(new CommandGetAddress())
		return new Promise((resolve) => {
			this.once('my_address', m => resolve(m.address))
		})
	}
}

module.exports = GenesisNode
