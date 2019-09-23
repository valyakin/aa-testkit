const Joi = require('joi')
const AbstractNode = require('../AbstractNode/AbstractNode')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	silent: Joi.boolean().default(true),
	genesisUnit: Joi.string().required(),
	initialWitness: Joi.string().required(),
	trustedRegistry: Joi.string().required(),
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
			this.genesisUnit,
			this.initialWitness,
			this.trustedRegistry,
		]
	}
}

module.exports = ObyteHub
