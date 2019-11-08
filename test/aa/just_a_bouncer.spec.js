const Testkit = require('../../main')
const { Network } = Testkit()
const { justABouncer } = require('./agents')

describe('Check `just a bouncer` AA', function () {
	this.timeout(120000)

	before(async () => {
		this.network = await Network.create()
	})

	it('Check agent deployment', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const deployer = await network.newHeadlessWallet().ready()
		const deployerAddress = await deployer.getAddress()

		const wallet = await network.newHeadlessWallet().ready()
		const walletAddress = await wallet.getAddress()

		await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
		await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
		await network.witness()

		const { address: agentAddress, unit: agentUnit, error: deploymentError } = await deployer.deployAgent(justABouncer)
		expect(deploymentError).to.be.null

		let walletBalance = await wallet.getBalance()

		expect(agentAddress).to.be.validAddress
		expect(agentUnit).to.be.validUnit
		expect(walletBalance.base.stable).to.be.equal(1000000)

		await network.witness(2)

		const { unit: newUnit } = await wallet.sendBytes({
			toAddress: agentAddress,
			amount: 10000,
		})

		expect(newUnit).to.be.validUnit
		await network.witness(2)

		walletBalance = await wallet.getBalance()
		expect(walletBalance.base.pending).to.be.equal(9000)
	}).timeout(60000)

	after(async () => {
		await this.network.stop()
	})
})
