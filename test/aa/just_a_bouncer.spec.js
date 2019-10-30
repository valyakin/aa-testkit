const Testkit = require('../../main')
const { Network } = Testkit()
const { justABouncer } = require('./agents')
const ojson = require('ocore/formula/parse_ojson')
const { promisify } = require('util')
const isValidAddress = require('ocore/validation_utils').isValidAddress

describe('Check `just a bouncer` AA', function () {
	this.timeout(120000)

	before(async () => {
		this.network = await Network.genesis()
	})

	it('Check agent deployment', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const deployer = await network.newAgentDeployer().ready()
		const deployerAddress = await deployer.getAddress()

		const wallet = await network.newHeadlessWallet().ready()
		const walletAddress = await wallet.getAddress()

		await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
		await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
		await network.witness()

		const agent = await promisify(ojson.parse)(justABouncer)
		const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(agent)

		let walletBalance = await wallet.getBalance()

		expect(isValidAddress(agentAddress)).to.be.true
		expect(agentUnit).to.be.a('string')
		expect(walletBalance.base.stable).to.be.equal(1000000)

		await network.witness(2)

		const { unit: newUnit } = await wallet.sendBytes({
			toAddress: agentAddress,
			amount: 10000,
		})

		expect(newUnit).to.be.a('string')
		await network.witness(2)

		walletBalance = await wallet.getBalance()
		expect(walletBalance.base.pending).to.be.equal(9000)
	}).timeout(60000)

	after(async () => {
		await this.network.stop()
	})
})
