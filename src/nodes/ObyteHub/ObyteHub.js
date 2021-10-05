const Joi = require('joi')
const config = require('config')['aa-testkit']
const AbstractNode = require('../AbstractNode/AbstractNode')
const {
	CommandCustom,
} = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	port: Joi.number().default(config.NETWORK_PORT),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class ObyteHub extends AbstractNode {
	constructor (params = {}) {
		super(params, schemaFactory)
		this.runChild(__dirname)

		this
			.on('password_required', () => this.sendPassword())
	}

	packArgv () {
		return [
			this.id,
			this.port,
			this.genesisUnit,
			this.initialWitnesses.length,
			...this.initialWitnesses,
		]
	}

	broadcastJoint (objJoint) {
		this.sendToChild(new CommandCustom({ payload: { topic: 'broadcastJoint', joint: objJoint } }))
	}
}

module.exports = ObyteHub
