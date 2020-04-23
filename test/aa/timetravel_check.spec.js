const { Testkit } = require('../../main')
const { Network } = Testkit()
const { timeDependentAA } = require('./agents')

describe('Check agent dependent on time', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create().run()
	})

	it('Deploy and check', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const deployer = await network.newHeadlessWallet().ready()
		const deployerAddress = await deployer.getAddress()

		const wallet = await network.newHeadlessWallet().ready()
		const walletAddress = await wallet.getAddress()

		await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
		const { unit } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
		await network.witnessUntilStable(unit)

		const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(timeDependentAA)

		expect(agentAddress).to.be.validAddress
		expect(agentUnit).to.be.validUnit

		await network.witnessUntilStable(agentUnit)

		const { unit: unitBeforeTravel } = await wallet.sendBytes({
			toAddress: agentAddress,
			amount: 10000,
		})
		expect(unitBeforeTravel).to.be.validUnit
		await this.network.witnessUntilStable(unitBeforeTravel)

		let state = await deployer.readAAStateVars(agentAddress)
		expect(state.vars.time).to.be.equal('past')
		const { error } = await network.timetravel({ to: '2050-01-01' })
		expect(error).to.be.null

		const { unit: unitAfterTravel } = await wallet.sendBytes({
			toAddress: agentAddress,
			amount: 10000,
		})
		expect(unitAfterTravel).to.be.validUnit
		await network.witnessUntilStable(unitAfterTravel)

		state = await deployer.readAAStateVars(agentAddress)

		expect(state.vars.time).to.be.equal('future')
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
