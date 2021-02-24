const path = require('path')
const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check getting Aa Response by AA feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.with.agent({ simple: path.join(__dirname, './files/sumAgent.oscript') })
			.with.wallet({ alice: 1e6 })
			.run()
	})

	it('Check network.getAaResponseToUnitByAA', async () => {
		const { unit, error } = await this.network.wallet.alice.triggerAaWithData({
			toAddress: this.network.agent.simple,
			amount: 10000,
			data: {
				a: 33,
				b: 44,
			},
		})

		expect(error).to.be.null
		expect(unit).to.be.validUnit

		const { response } = await this.network.getAaResponseToUnitByAA(unit, this.network.agent.simple)
		expect(response.response.responseVars.result).to.be.equal(77)
	}).timeout(30000)

	it('Check network.getAaResponseToUnitByAAOnNode', async () => {
		const { unit, error } = await this.network.wallet.alice.triggerAaWithData({
			toAddress: this.network.agent.simple,
			amount: 10000,
			data: {
				a: 4000,
				b: 5000,
			},
		})

		expect(error).to.be.null
		expect(unit).to.be.validUnit

		const { response } = await this.network.getAaResponseToUnitByAAOnNode(this.network.wallet.alice, unit, this.network.agent.simple)
		expect(response.response.responseVars.result).to.be.equal(9000)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
