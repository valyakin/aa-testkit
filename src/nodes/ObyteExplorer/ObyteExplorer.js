const Joi = require('joi')
const config = require('config')['aa-testkit']
const AbstractNode = require('../AbstractNode/AbstractNode')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	webPort: Joi.number().default(8080),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
	hub: Joi.string().default(`127.0.0.1:${config.NETWORK_PORT}`),
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
			this.hub,
			this.genesisUnit,
			this.webPort,
			this.initialWitnesses.length,
			...this.initialWitnesses,
		]
	}

	childReady (m) {
		console.log('Obyte Explorer is running on http://localhost:3000')
	}
}

module.exports = ObyteExplorer
