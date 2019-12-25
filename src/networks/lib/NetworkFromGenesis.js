const Joi = require('joi')
const path = require('path')
const mkdirp = require('mkdirp')
const config = require('config')['aa-testkit']

const { getIdForPrefix, getNetworkPort, createRundir, lock, unlock } = require('../../utils')
const { HeadlessWallet, GenesisNode, ObyteHub, ObyteExplorer } = require('../../nodes')

const paramsSchema = () => ({
	rundir: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class NetworkFromGenesis {
	constructor (params) {
		const { error, value } = Joi.validate(params, paramsSchema(), {})
		if (error) throw new Error(`${error}`)
		Object.assign(this, value)

		this.nodes = {
			headlessWallets: [],
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
			...this.nodes.obyteExplorers,
			this.genesisNode,
			this.hub,
		]
	}

	async stop () {
		return Promise.all(this.nodesList.map(n => n.stop()))
	}

	async timetravel ({ to, shift } = {}) {
		return Promise.all(this.nodesList.map(n => n.timetravel({ to, shift }))).then(errors => {
			return {
				error:
					errors
						.filter(e => e.error)
						.map(e => `${e.id}: ${e.error}`)
						.join(',') ||
					null,
			}
		})
	}

	async sync () {
		const arrayMci = await Promise.all(this.nodesList.map(n => n.getLastMCI()))
		const maxMci = Math.max(...arrayMci)

		const laggedNodes = arrayMci
			.map((mci, index) => mci < maxMci ? index : -1)
			.filter(e => e > -1)
			.map(i => this.nodesList[i])

		if (laggedNodes.length) {
			await Promise.all(laggedNodes.map(n => n.waitForNewJoint()))
			return this.sync()
		}
	}

	async witnessAndStabilize () {
		await this.sync()
		const stabilization = Promise.all(this.nodesList.map(n => n.stabilize()))

		await this.genesisNode.postWitness()
		return stabilization
	}

	async witnessUntilStable (unit) {
		if (!unit) return
		await this.sync()

		const props = await Promise.all(this.nodesList.map(n => n.getUnitProps({ unit })))
		const unstableNode = props.find(p => !p.unitProps.is_stable)
		if (unstableNode) {
			await this.witnessAndStabilize()
			return this.witnessUntilStable(unit)
		}
	}

	async getAaResponseToUnit (unit) {
		await this.witnessAndStabilize()
		const response = this.genesisNode.getAaResponseToUnit(unit)
		if (response) {
			return { response }
		} else {
			return this.getAaResponseToUnit(unit)
		}
	}

	newObyteExplorer (params) {
		const explorer = new ObyteExplorer({
			rundir: this.rundir,
			genesisUnit: this.genesisUnit,
			id: getIdForPrefix(this.rundir, 'obyte-explorer-'),
			initialWitnesses: this.initialWitnesses,
			hub: `localhost:${config.NETWORK_PORT}`,
			...params,
		})
		this.nodes.obyteExplorers.push(explorer)
		return explorer
	}

	newHeadlessWallet (params) {
		const wallet = new HeadlessWallet({
			rundir: this.rundir,
			genesisUnit: this.genesisUnit,
			id: getIdForPrefix(this.rundir, 'headless-wallet-'),
			hub: `localhost:${config.NETWORK_PORT}`,
			...params,
		})
		this.nodes.headlessWallets.push(wallet)
		return wallet
	}
}

// process.on('exit', () => {
// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!exit')
// })
// process.on('SIGINT', () => {
// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!SIGINT')
// })

const genesis = async (genesisParams, hubParams) => {
	mkdirp.sync(config.TESTDATA_DIR)
	const rundir = await createRundir(config.TESTDATA_DIR)

	await lock(path.join(config.TESTDATA_DIR, 'start_network.lock'))
	config.NETWORK_PORT = await getNetworkPort(config.NETWORK_PORT)
	console.log(`rundir: ${rundir}, port: ${config.NETWORK_PORT}`)

	const genesisNode = new GenesisNode({
		rundir,
		id: 'genesis-node',
		hub: `localhost:${config.NETWORK_PORT}`,
		...genesisParams,
	})
	const { genesisUnit, genesisAddress } = await genesisNode.createGenesis()

	const hub = new ObyteHub({
		rundir: rundir,
		genesisUnit: genesisUnit,
		initialWitnesses: [genesisAddress],
		id: getIdForPrefix(rundir, 'obyte-hub-'),
		port: config.NETWORK_PORT,
		...hubParams,
	})

	await genesisNode.ready()
	await hub.ready()

	await unlock(path.join(config.TESTDATA_DIR, 'start_network.lock'))

	// setTimeout(() => {
	// 	console.log('stop')
	// 	hub.stop()
	// 	genesisNode.stop()
	// }, 30000)
	// throw new Error('123123')
	const network = new NetworkFromGenesis({
		rundir,
		genesisUnit,
		initialWitnesses: [genesisAddress],
	})

	await genesisNode.loginToHub()

	network.genesisNode = genesisNode
	network.hub = hub
	return network
}

module.exports = genesis
