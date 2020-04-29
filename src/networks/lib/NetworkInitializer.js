const { asyncStartHeadlessWallets } = require('../../utils')

class NetworkInitializer {
	constructor ({ network }) {
		this.network = network

		this.assets = {}
		this.agents = {}
		this.wallets = {}
		this.deployer = null
		this.obyteExplorer = null

		this.initializer = {
			wallets: {},
			assets: {},
			agents: {},
			deployer: null,
			explorer: null,
		}

		this.isInitialized = false
	}

	async initialize ({ wallets, agents, deployer, assets, explorer } = {}) {
		await this.network.genesisNode.ready()

		if (explorer) await this.initializeExplorer(explorer)

		const walletNodes = await asyncStartHeadlessWallets(this.network, Object.keys(wallets).length + (deployer ? 1 : 0))
		if (deployer) this.deployer = walletNodes.shift()
		for (const walletName in wallets) {
			this.wallets[walletName] = walletNodes.shift()
		}

		if (deployer) await this.initializeDeployer()
		await this.initializeAssets(assets)
		await this.initializeAgents(agents)
		const units = await this.initializeWallets(wallets)

		for (const unit of units) {
			await this.network.witnessUntilStable(unit)
		}

		this.isInitialized = true
	}

	async initializeDeployer () {
		const { unit, error } = await this.network.genesisNode.sendBytes({ toAddress: await this.deployer.getAddress(), amount: 100e9 })
		if (error) throw new Error(error)
		return this.network.witnessUntilStableOnNode(this.deployer, unit)
	}

	async initializeAssets (assets = {}) {
		for (const name in assets) {
			const { unit, error } = await this.deployer.createAsset(assets[name])
			if (error) throw new Error(error)
			this.assets[name] = unit
			await this.network.witnessUntilStable(unit)
		}
	}

	async initializeAgents (agents = {}) {
		for (const name in agents) {
			const { address, unit, error } = await this.deployer.deployAgent(agents[name])
			if (error) throw new Error(error)
			this.agents[name] = address
			await this.network.witnessUntilStable(unit)
		}
	}

	async initializeWallets (wallets = {}) {
		const walletsWithAddresses = await Promise.all(Object.keys(wallets).map(async name => {
			const address = await this.wallets[name].getAddress()

			return {
				name,
				address,
				balances: wallets[name],
			}
		}))

		const outputsMap = walletsWithAddresses.reduce((acc, cur) => {
			for (const asset in cur.balances) {
				const entry = { address: cur.address, amount: cur.balances[asset] }
				acc[asset] = acc[asset]
					? [...acc[asset], entry]
					: [entry]
			}
			return acc
		}, {})

		return Promise.all(Object.keys(outputsMap).map(async asset => {
			if (asset === 'base') {
				const { error, unit } = await this.network.genesisNode.sendMulti({
					base_outputs: outputsMap[asset],
					change_address: await this.network.genesisNode.getAddress(),
					asset: 'base',
				})

				if (error) throw new Error(`Error sending bytes to wallets: ${error}`)
				return unit
			} else {
				if (!this.assets[asset]) throw new Error(`No such asset with name '${asset}'`)

				const { error, unit } = await this.deployer.sendMulti({
					asset_outputs: outputsMap[asset],
					change_address: await this.deployer.getAddress(),
					asset: this.assets[asset],
				})

				if (error) throw new Error(`Error sending asset ${asset} to wallets: ${error}`)
				return unit
			}
		}))
	}

	async initializeExplorer (explorer = {}) {
		this.obyteExplorer = await this.network.newObyteExplorer({ webPort: explorer.port })
		return this.obyteExplorer.ready()
	}

	get with () {
		return this
	}

	explorer ({ port } = {}) {
		this.initializer.deployer = true
		this.initializer.explorer = {
			port,
		}
		return this
	}

	wallet (wallet) {
		const name = Object.keys(wallet)[0]
		const balances = typeof wallet[name] === 'object'
			? wallet[name]
			: { base: wallet[name] }

		this.initializer.wallets[name] = balances
		return this
	}

	agent (agent) {
		const name = Object.keys(agent)[0]
		this.initializer.agents[name] = agent[name]
		this.initializer.deployer = true
		return this
	}

	asset (asset) {
		const defaults = {
			is_private: false,
			is_transferrable: true,
			auto_destroy: false,
			issued_by_definer_only: true,
			cosigned_by_definer: false,
			spender_attested: false,
			fixed_denominations: false,
		}

		const name = Object.keys(asset)[0]
		this.initializer.assets[name] = Object.assign({}, defaults, asset[name])
		this.initializer.deployer = true
		return this
	}

	async run () {
		await this.network.run()
		await this.initialize(this.initializer)
		return this.network
	}
}

module.exports = NetworkInitializer
