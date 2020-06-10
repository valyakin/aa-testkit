const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const { MessageChildReady } = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	port: Joi.number().required(),
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
			port,
			genesisUnit,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
			port,
			genesisUnit,
			initialWitnesses,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.constants.COUNT_WITNESSES = this.initialWitnesses.length
		this.constants.MAJORITY_OF_WITNESSES = this.constants.COUNT_WITNESSES % 2 === 0
			? this.constants.COUNT_WITNESSES / 2 + 1
			: Math.ceil(this.constants.COUNT_WITNESSES / 2)

		this.conf = require('ocore/conf.js')
		this.conf.initial_witnesses = this.initialWitnesses
		this.conf.port = this.port

		this.network = require('ocore/network.js')

		this.hub = require('obyte-hub')
		setTimeout(() => {
			this.sendToParent(new MessageChildReady())
		})
	}

	logPrefix () {
		return ''
	}
}

const child = new ObyteHubChild(process.argv)
child.start()
