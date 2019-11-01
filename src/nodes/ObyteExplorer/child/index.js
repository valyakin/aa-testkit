const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const { MessageChildReady } = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	webPort: Joi.number().default(8080),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class ObyteExplorerChild extends AbstractChild {
	constructor (argv) {
		const params = ObyteExplorerChild.unpackArgv(argv)
		super(params, paramsSchema)
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
			genesisUnit,
			webPort,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
			hub,
			webPort,
			genesisUnit,
			initialWitnesses,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.conf = require('ocore/conf.js')
		this.conf.initial_witnesses = this.initialWitnesses
		this.conf.webPort = this.webPort

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub
		this.conf.initial_peers = [`${this.conf.WS_PROTOCOL}${this.hub}`]

		this.explorer = require('obyte-explorer/explorer.js')
		this.sendParent(new MessageChildReady())
	}

	logPrefix () {
		return ''
	}
}

const child = new ObyteExplorerChild(process.argv)
child.start()
