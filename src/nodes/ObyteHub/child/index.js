const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const { MessageChildReady } = requireRoot('src/messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class ObyteHubChild extends AbstractChild {
	constructor (argv) {
		const params = ObyteHubChild.unpackArgv(argv)
		super(params, paramsSchema)
	}

	static unpackArgv (argv) {
		const [,,
			id,
			genesisUnit,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
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

		this.hub = require('obyte-hub')
		this.sendParent(new MessageChildReady())
	}
}

const child = new ObyteHubChild(process.argv)
child.start()
