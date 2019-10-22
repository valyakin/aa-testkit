const Joi = require('joi')
const AbstractNode = require('../AbstractNode/AbstractNode')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	silent: Joi.boolean().default(true),
	genesisUnit: Joi.string().required(),
	webPort: Joi.number().default(8080),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class ObyteExplorer extends AbstractNode {
	constructor (params = {}) {
		super(params, schemaFactory)
		this.runChild(__dirname)

		this.once('child_ready', (m) => this.childReady(m))
	}

	packArgv () {
		return [
			this.id,
			this.genesisUnit,
			this.webPort,
			this.initialWitnesses.length,
			this.initialWitnesses,
		]
	}

	childReady (m) {
		console.log(`Obyte Explorer is running on http://localhost:${this.webPort}`)
	}
}

module.exports = ObyteExplorer
