const { asyncStartHeadlessWallets } = require('../../utils')

class NetworkInitializer {
	constructor ({ network }) {
		this.network = network

		this.assets = {}
		this.agents = {}
		this.wallets = {}
		this.deployer = null

		this.initializer = {
			wallets: {},
			assets: {},
			agents: {},
			deployer: null,
		}

		this.isInitialized = false
	}

	async initialize ({ wallets, agents, deployer, assets } = {}) {
		await this.network.genesisNode.ready()

		const walletNodes = await asyncStartHeadlessWallets(this.network, Object.keys(wallets).length + (deployer ? 1 : 0))
		if (deployer) this.deployer = walletNodes.shift()
		for (const walletName in wallets) {
			this.wallets[walletName] = walletNodes.shift()
		}

		if (deployer) await this.initializeDeployer()
		await this.initializeAssets(assets)
		await this.initializeAgents(agents)
		await this.initializeWallets(wallets)
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
	}

	initializeWallets (wallets = {}) {
		return Promise.all(Object.keys(wallets).map(async name => {
			return Promise.all(
				Object.keys(wallets[name]).map(async asset => {
					if (asset === 'base') {
						const { unit, error } = await this.network.genesisNode.sendBytes({ toAddress: await this.wallets[name].getAddress(), amount: wallets[name].base })
						if (error) throw new Error(`Error sending '${asset}' to '${name}': ${error}`)
						return unit
					} else {
						if (!this.assets[asset]) throw new Error(`No such asset with name '${asset}'`)
						const { unit, error } = await this.deployer.sendMulti({
							asset_outputs: [{
								address: await this.wallets[name].getAddress(),
								amount: wallets[name][asset],
							}],
							change_address: await this.deployer.getAddress(),
							asset: this.assets[asset],
						})
						if (error) throw new Error(`Error sending '${asset}' to '${name}': ${error}`)
						return unit
					}
				}),
			)
		}))
	}

	get with () {
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
		await this.initialize(this.initializer)
		const unit = await this.network.genesisNode.postWitness()
		await this.network.witnessUntilStable(unit)
		return this.network
	}
}

module.exports = NetworkInitializer
