const path = require('path')
const Joi = require('joi')
const config = require('config')

const { getIdForPrefix } = requireRoot('src/utils')
const { HeadlessWallet, GenesisNode, ObyteHub } = requireRoot('src/nodes')

const paramsSchema = () => ({
	runid: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class NetworkFromGenesis {
	constructor (params) {
		const { error, value } = Joi.validate(params, paramsSchema(), {})
		if (error) throw new Error(`${error}`)
		Object.assign(this, value)

		this.rundir = path.join(config.TESTDATA_DIR, this.runid)
		this.wallets = []
	}

	getGenesisNode () {
		return this.genesisNode
	}

	getHub () {
		return this.hub
	}

	async stop () {
		return Promise.all([
			...this.wallets.map(w => w.stop()),
			this.hub.stop(),
			this.genesisNode.stop(),
		])
	}

	async witnessAndStabilize () {
		const stabilization = Promise.all([
			...this.wallets.map(w => w.stabilize()),
			this.genesisNode.stabilize(),
			this.hub.stabilize(),
		])

		await this.genesisNode.postWitness()
		return stabilization
	}

	newHeadlessWallet (params) {
		const wallet = new HeadlessWallet({
			rundir: this.rundir,
			genesisUnit: this.genesisUnit,
			id: getIdForPrefix(this.rundir, 'headless-wallet-'),
			passphrase: config.DEFAULT_PASSPHRASE,
			...params,
		})
		this.wallets.push(wallet)
		return wallet
	}
}

const genesis = async () => {
	const runid = getIdForPrefix(config.TESTDATA_DIR, 'runid-')
	const rundir = path.join(config.TESTDATA_DIR, runid)

	const genesisNode = new GenesisNode({
		rundir,
		id: 'genesis-node',
		passphrase: config.DEFAULT_PASSPHRASE,
	})
	const { genesisUnit, genesisAddress } = await genesisNode.createGenesis()

	const hub = new ObyteHub({
		id: getIdForPrefix(rundir, 'obyte-hub-'),
		rundir: rundir,
		genesisUnit: genesisUnit,
		initialWitnesses: [genesisAddress],
	})

	const network = new NetworkFromGenesis({
		runid,
		genesisUnit,
		initialWitnesses: [genesisAddress],
	})

	await genesisNode.ready()
	await hub.ready()
	await genesisNode.loginToHub()

	network.genesisNode = genesisNode
	network.hub = hub
	return network
}

module.exports = genesis
