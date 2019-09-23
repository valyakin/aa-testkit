const Joi = require('joi')
const { CommandLoginToHub, CommandSendBytes } = requireRoot('src/messages')
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

	loginToHub () {
		this.sendChild(new CommandLoginToHub())
	}

	sendPassword () {
		setTimeout(() => {
			this.child.stdin.write(this.passphrase + '\n')
		}, 2000)
	}

	sendBytes ({ toAddress, amount }) {
		this.sendChild(new CommandSendBytes({ toAddress, amount }))
	}
}

module.exports = GenesisNode
