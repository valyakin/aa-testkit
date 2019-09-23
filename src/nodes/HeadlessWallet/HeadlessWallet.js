const Joi = require('joi')
const AbstractNode = require('../AbstractNode/AbstractNode')
const { CommandGetAddress, CommandSendBytes } = requireRoot('src/messages')

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

	sendBytes ({ toAddress, amount }) {
		this.sendChild(new CommandSendBytes({ toAddress, amount }))
	}

	// async sendBytes ({ toAddress, amount }) {
	// 	return new Promise((resolve, reject) => {
	// 		const handler = (message) => {
	// 			if (message.topic === 'bytes_sent') {
	// 				this.child.removeListener('message', handler)
	// 				if (message.err) {
	// 					reject(message.err)
	// 				} else {
	// 					resolve(message.unit)
	// 				}
	// 			}
	// 		}
	// 		this.child.on('message', handler)
	// 		this.child.send({ topic: 'send_bytes', toAddress, amount })
	// 	})
	// }
}

module.exports = HeadlessWallet
