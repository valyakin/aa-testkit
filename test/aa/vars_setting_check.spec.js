const { Testkit } = require('../../main')
const { Network } = Testkit()
const { varsSettingCheck } = require('./agents')

describe('AA state vars', function () {
	this.timeout(60000)

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

		const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(varsSettingCheck)

		expect(agentAddress).to.be.validAddress
		expect(agentUnit).to.be.validUnit
		await network.witness(2)

		this.agentAddress = agentAddress
		this.deployer = deployer
		this.wallet = wallet
	}).timeout(30000)

	it('Check agent state vars read', async () => {
		const { agentAddress, wallet, network, deployer } = this

		const { unit } = await wallet.sendData({
			toAddress: agentAddress,
			amount: 10000,
			payload: {
				var: 'trigger_var',
			},
		})

		expect(unit).to.be.validUnit
		await network.witness(2)

		const { vars } = await deployer.readAAStateVars(agentAddress)

		expect(vars.constant_var).to.be.equal('constant_var')
		expect(vars.trigger_var).to.be.equal('trigger_var')
		expect(vars.sum_var).to.be.equal('579')
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
