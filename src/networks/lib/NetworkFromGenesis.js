const path = require('path')
const Joi = require('joi')
const config = require('config')

const { getIdForPrefix } = requireRoot('src/utils')
const { HeadlessWallet, AgentDeployer, GenesisNode, ObyteHub, ObyteExplorer } = requireRoot('src/nodes')

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
		this.nodes = {
			headlessWallets: [],
			agentDeployers: [],
			obyteExplorers: [],
		}
	}

	getGenesisNode () {
		return this.genesisNode
	}

	getHub () {
		return this.hub
	}

	get nodesList () {
		return [
			...this.nodes.headlessWallets,
			...this.nodes.agentDeployers,
			...this.nodes.obyteExplorers,
			this.genesisNode,
			this.hub,
		]
	}

	async stop () {
		return Promise.all(this.nodesList.map(n => n.stop()))
	}

	async timetravelTo (to) {
		return Promise.all(this.nodesList.map(n => n.timeTravel({ to })))
	}

	async witness (n = 1) {
		for (let i = 0; i < n; i++) {
			await this.witnessAndStabilize()
		}
	}

	async witnessAndStabilize () {
		const stabilization = Promise.all(this.nodesList.map(n => n.stabilize()))

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
		this.nodes.headlessWallets.push(wallet)
		return wallet
	}

	newAgentDeployer (params) {
		const deployer = new AgentDeployer({
			rundir: this.rundir,
			genesisUnit: this.genesisUnit,
			id: getIdForPrefix(this.rundir, 'agent-deployer-'),
			passphrase: config.DEFAULT_PASSPHRASE,
			...params,
		})
		this.nodes.agentDeployers.push(deployer)
		return deployer
	}

	newObyteExplorer (params) {
		const explorer = new ObyteExplorer({
			rundir: this.rundir,
			genesisUnit: this.genesisUnit,
			id: getIdForPrefix(this.rundir, 'obyte-explorer-'),
			initialWitnesses: this.initialWitnesses,
			...params,
		})
		this.nodes.obyteExplorers.push(explorer)
		return explorer
	}
}

const genesis = async () => {
	const runid = getIdForPrefix(config.TESTDATA_DIR, 'runid-')
	const rundir = path.join(config.TESTDATA_DIR, runid)
	console.log('rundir', rundir)

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
