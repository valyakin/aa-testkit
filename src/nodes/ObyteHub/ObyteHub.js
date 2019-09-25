const Joi = require('joi')
const AbstractNode = require('../AbstractNode/AbstractNode')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	silent: Joi.boolean().default(true),
	genesisUnit: Joi.string().required(),
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
			this.genesisUnit,
			this.initialWitnesses.length,
			this.initialWitnesses,
		]
	}
}

module.exports = ObyteHub
