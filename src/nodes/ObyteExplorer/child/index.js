const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const { MessageChildReady } = requireRoot('src/messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
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
			genesisUnit,
			webPort,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
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

		this.explorer = require('obyte-explorer/explorer.js')
		this.sendParent(new MessageChildReady())
	}
}

const child = new ObyteExplorerChild(process.argv)
child.start()
