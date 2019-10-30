const Joi = require('joi')
const config = require('config')['aa-testkit']
const { CommandLoginToHub, CommandSendBytes, CommandPostWitness, CommandGetAddress } = require('../../messages')
const AbstractNode = require('../AbstractNode/AbstractNode')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	silent: Joi.boolean().default(true),
	passphrase: Joi.string().default(config.DEFAULT_PASSPHRASE),
	hub: Joi.string().default(`localhost:${config.NETWORK_PORT}`),
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
			this.hub,
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

	loginToHub () {
		return new Promise(resolve => {
			this.once('connected_to_hub', () => resolve(this))
			this.sendChild(new CommandLoginToHub())
		})
	}

	sendPassword () {
		setTimeout(() => {
			this.child.stdin.write(this.passphrase + '\n')
		}, 1500)
	}

	sendBytes ({ toAddress, amount }) {
		return new Promise(resolve => {
			this.once('sent_bytes', (m) => resolve({ unit: m.unit, error: m.error }))
			this.sendChild(new CommandSendBytes({ toAddress, amount }))
		})
	}

	postWitness () {
		this.sendChild(new CommandPostWitness())
	}

	getAddress () {
		this.sendChild(new CommandGetAddress())
		return new Promise((resolve) => {
			this.once('my_address', m => resolve(m.address))
		})
	}
}

module.exports = GenesisNode
