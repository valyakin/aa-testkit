const Joi = require('joi')
const path = require('path')
const mkdirp = require('mkdirp')
const config = require('config')['aa-testkit']

const { getIdForPrefix, sleep } = require('../../utils')
const { HeadlessWallet, GenesisNode, ObyteHub, ObyteExplorer } = require('../../nodes')

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
			await Promise.race([
				Promise.all(laggedNodes.map(n => n.waitForNewJoint())),
				sleep(100),
			])
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

	async witnessUntilStableOnNode (node, unit) {
		if (!unit || !node) return

		const { unitProps } = await node.getUnitProps({ unit })
		if (!unitProps.is_stable) {
			const stabilization = node.stabilize()
			await this.genesisNode.postWitness()
			await stabilization
			return this.witnessUntilStableOnNode(node, unit)
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
			...params,
		})
		this.nodes.headlessWallets.push(wallet)
		return wallet
	}
}

const genesis = async (genesisParams, hubParams) => {
	mkdirp.sync(config.TESTDATA_DIR)
	const runid = getIdForPrefix(config.TESTDATA_DIR, 'runid-')
	const rundir = path.join(config.TESTDATA_DIR, runid)
	console.log('rundir', rundir)

	const genesisNode = new GenesisNode({
		rundir,
		id: 'genesis-node',
		...genesisParams,
	})
	const { genesisUnit, genesisAddress } = await genesisNode.createGenesis()

	const hub = new ObyteHub({
		rundir: rundir,
		genesisUnit: genesisUnit,
		initialWitnesses: [genesisAddress],
		id: getIdForPrefix(rundir, 'obyte-hub-'),
		...hubParams,
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
