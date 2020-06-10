const AbstractNode = require('../AbstractNode/AbstractNode')
const config = require('config')['aa-testkit']
const Joi = require('joi')

const {
	CommandPostWitness,
	CommandGetAddress,
	CommandLoginToHub,
} = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	passphrase: Joi.string().default('0000'),
	hub: Joi.string().default(`localhost:${config.NETWORK_PORT}`),
	mnemonic: Joi.string().default(null),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class ObyteWitness extends AbstractNode {
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

	packArgv () {
		return [
			this.id,
			this.hub,
			this.genesisUnit,
			this.initialWitnesses.length,
			...this.initialWitnesses,
		]
	}

	sendPassword () {
		this.child.stdin.write(this.passphrase + '\n')
	}

	async getAddress () {
		this.sendToChild(new CommandGetAddress())
		return new Promise((resolve) => {
			this.once('my_address', m => resolve(m.address))
		})
	}

	loginToHub () {
		return new Promise(resolve => {
			this.once('connected_to_hub', () => resolve(this))
			this.sendToChild(new CommandLoginToHub())
		})
	}

	postWitness () {
		return new Promise(resolve => {
			this.once('witness_posted', ({ unit }) => {
				this.receivedUnits.push(unit)
				resolve(unit)
			})
			this.sendToChild(new CommandPostWitness())
		})
	}
}

module.exports = ObyteWitness
