require('../../require')
const chai = require('chai')
const Network = requireRoot('src/networks')
const expect = chai.expect
const { varsSettingCheck } = require('./agents')
const ojson = require('ocore/formula/parse_ojson')
const { promisify } = require('util')
const isValidAddress = require('ocore/validation_utils').isValidAddress

describe('Check AA state vars setting', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.genesis()
	})

	it('Check agent deployment', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const deployer = await network.newAgentDeployer({ silent: true }).ready()
		const deployerAddress = await deployer.getAddress()

		const wallet = await network.newHeadlessWallet().ready()
		const walletAddress = await wallet.getAddress()

		await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
		await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
		await network.witness()

		const agent = await promisify(ojson.parse)(varsSettingCheck)
		const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(agent)

		expect(isValidAddress(agentAddress)).to.be.true
		expect(agentUnit).to.be.a('string')
		await network.witness(2)

		const newUnit = await wallet.sendData({
			toAddress: agentAddress,
			amount: 10000,
			payload: {
				var: 'trigger_var',
			},
		})

		expect(newUnit).to.be.a('string')
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
