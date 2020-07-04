const path = require('path')
const { Testkit } = require('../../main')
const { Network, Utils } = Testkit()

describe('Check receiving AA response feature', function () {
	this.timeout(120000)

	before(async () => {
		this.network = await Network.create()
			.with.agent({ bank: path.join(__dirname, './agents/lib/deposit_aa.aa') })
			.with.wallet({ alice: 1e9 })
			.with.wallet({ bob: 1e9 })
			.run()
	})

	it('freeze time and Alice deposites 1e6 in bank', async () => {
		await this.network.timefreeze()

		const { unit, error } = await this.network.wallet.alice.triggerAaWithData({
			toAddress: this.network.agent.bank,
			amount: 1e6 + 10000,
			data: {
				deposit: true,
			},
		})

		expect(error).to.be.null
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('pass time and Bob deposits 1e6', async () => {
		await Utils.sleep(1000)

		const { unit, error } = await this.network.wallet.bob.triggerAaWithData({
			toAddress: this.network.agent.bank,
			amount: 1e6 + 10000,
			data: {
				deposit: true,
			},
		})

		expect(error).to.be.null
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('pass time and confirm withdrawal amounts didn\'t change', async () => {
		await Utils.sleep(2000)

		const { unit: aliceUnit, error: aliceError } = await this.network.wallet.alice.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(aliceError).to.be.null

		const { unit: bobUnit, error: bobError } = await this.network.wallet.bob.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(bobError).to.be.null

		await this.network.witnessUntilStable(bobUnit)
		const { response: aliceResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.alice, aliceUnit)
		const { response: bobResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.bob, bobUnit)

		expect(aliceResponse.response.error).to.be.undefined
		expect(aliceResponse.response.responseVars.withdraw).to.be.equal(1e6)

		expect(bobResponse.response.error).to.be.undefined
		expect(bobResponse.response.responseVars.withdraw).to.be.equal(1e6)
	}).timeout(30000)

	it('timetravel and check withdrawal changed', async () => {
		await this.network.timetravel({ shift: 3000 })

		const { unit: aliceUnit, error: aliceError } = await this.network.wallet.alice.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(aliceError).to.be.null

		const { unit: bobUnit, error: bobError } = await this.network.wallet.bob.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(bobError).to.be.null

		await this.network.witnessUntilStable(bobUnit)
		const { response: aliceResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.alice, aliceUnit)
		const { response: bobResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.bob, bobUnit)

		expect(aliceResponse.response.error).to.be.undefined
		expect(aliceResponse.response.responseVars.withdraw).to.be.equal(1030301)

		expect(bobResponse.response.error).to.be.undefined
		expect(bobResponse.response.responseVars.withdraw).to.be.equal(1030301)
	}).timeout(30000)

	it('pass time and check withdrawal did not change(time still frozen after timetravel)', async () => {
		await Utils.sleep(2000)

		const { unit: aliceUnit, error: aliceError } = await this.network.wallet.alice.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(aliceError).to.be.null

		const { unit: bobUnit, error: bobError } = await this.network.wallet.bob.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(bobError).to.be.null

		await this.network.witnessUntilStable(bobUnit)
		const { response: aliceResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.alice, aliceUnit)
		const { response: bobResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.bob, bobUnit)

		expect(aliceResponse.response.error).to.be.undefined
		expect(aliceResponse.response.responseVars.withdraw).to.be.equal(1030301)

		expect(bobResponse.response.error).to.be.undefined
		expect(bobResponse.response.responseVars.withdraw).to.be.equal(1030301)
	}).timeout(30000)

	it('timerun, pass time and check withdrawal changed', async () => {
		await this.network.timerun()
		await Utils.sleep(2000)

		const { unit: aliceUnit, error: aliceError } = await this.network.wallet.alice.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(aliceError).to.be.null

		const { unit: bobUnit, error: bobError } = await this.network.wallet.bob.sendBytes({
			toAddress: this.network.agent.bank,
			amount: 20000,
		})
		expect(bobError).to.be.null

		await this.network.witnessUntilStable(bobUnit)
		const { response: aliceResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.alice, aliceUnit)
		const { response: bobResponse } = await this.network.getAaResponseToUnitOnNode(this.network.wallet.bob, bobUnit)

		expect(aliceResponse.response.error).to.be.undefined
		expect(aliceResponse.response.responseVars.withdraw).to.be.above(1030301)

		expect(bobResponse.response.error).to.be.undefined
		expect(bobResponse.response.responseVars.withdraw).to.be.above(1030301)
	}).timeout(30000)

	after(async () => {
		if (this.network) await this.network.stop()
	})
})
