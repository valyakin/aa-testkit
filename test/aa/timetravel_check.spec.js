const Testkit = require('../../main')
const { Network } = Testkit()
const { timeDependentAA } = require('./agents')
const ojson = require('ocore/formula/parse_ojson')
const { promisify } = require('util')
const isValidAddress = require('ocore/validation_utils').isValidAddress

describe('Network time travel function', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.genesis()
	})

	it('Check agent dependent on time', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const deployer = await network.newAgentDeployer().ready()
		const deployerAddress = await deployer.getAddress()

		const wallet = await network.newHeadlessWallet().ready()
		const walletAddress = await wallet.getAddress()

		await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
		await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
		await network.witness()

		const agent = await promisify(ojson.parse)(timeDependentAA)
		const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(agent)

		expect(isValidAddress(agentAddress)).to.be.true
		expect(agentUnit).to.be.a('string')
		await network.witness(2)

		const { unit: unitBeforeTravel } = await wallet.sendBytes({
			toAddress: agentAddress,
			amount: 10000,
		})
		expect(unitBeforeTravel).to.be.a('string')
		await network.witness(2)

		let state = await deployer.readAAStateVars(agentAddress)

		expect(state.vars.time).to.be.equal('past')

		await network.timetravelTo('2050-01-01')

		const { unit: unitAfterTravel } = await wallet.sendBytes({
			toAddress: agentAddress,
			amount: 10000,
		})
		expect(unitAfterTravel).to.be.a('string')
		await network.witness(2)

		state = await deployer.readAAStateVars(agentAddress)

		expect(state.vars.time).to.be.equal('future')
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
