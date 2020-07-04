const path = require('path')
const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('getBalanceOf AbstractNode feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.with.wallet({ alice: 100e9 })
			.with.wallet({ bob: 200e9 })
			.with.agent({ simple: path.join(__dirname, './files/sumAgent.oscript') })
			.run()
	})

	it('Check getBalanceOf another wallet', async () => {
		const bobBalance1 = await this.network.wallet.bob.getBalance()
		const bobBalance2 = await this.network.wallet.alice.getBalanceOf(await this.network.wallet.bob.getAddress())

		expect(bobBalance2.base.stable).to.be.equal(200e9)
		expect(bobBalance2.base.stable).to.be.equal(bobBalance1.base.stable)

		expect(bobBalance2.base.pending).to.be.equal(0)
		expect(bobBalance2.base.pending).to.be.equal(bobBalance1.base.pending)
	}).timeout(30000)

	it('Check getBalanceOf AA', async () => {
		const { unit, error } = await this.network.wallet.alice.triggerAaWithData({
			toAddress: this.network.agent.simple,
			amount: 10e6,
			data: {
				a: 2,
				b: 2,
			},
		})

		expect(error).to.be.null

		await this.network.witnessUntilStable(unit)
		const aaBalance = await this.network.wallet.bob.getBalanceOf(this.network.agent.simple)

		expect(aaBalance.base.stable).to.be.equal(10e6)
		expect(aaBalance.base.pending).to.be.equal(0)
	}).timeout(30000)

	it('Check balance after sending a payment', async () => {
		const { unit, error } = await this.network.wallet.alice.sendBytes({ toAddress: await this.network.wallet.bob.getAddress(), amount: 50e9 })
		expect(error).to.be.null

		const aliceBalanceBefore = await this.network.wallet.alice.getBalanceOf(await this.network.wallet.alice.getAddress())
		expect(aliceBalanceBefore.base.pending).to.be.equal(49989998297)
		expect(aliceBalanceBefore.base.stable).to.be.equal(454)

		await this.network.wallet.bob.waitForUnit(unit)

		const bobBalanceBefore = await this.network.wallet.bob.getBalanceOf(await this.network.wallet.bob.getAddress())
		expect(bobBalanceBefore.base.pending).to.be.equal(50e9)
		expect(bobBalanceBefore.base.stable).to.be.equal(200e9)

		await this.network.witnessUntilStable(unit)

		const aliceBalanceAfter = await this.network.wallet.alice.getBalanceOf(await this.network.wallet.alice.getAddress())
		expect(aliceBalanceAfter.base.stable).to.be.equal(49989999205)
		expect(aliceBalanceAfter.base.pending).to.be.equal(0)

		const bobBalanceAfter = await this.network.wallet.bob.getBalanceOf(await this.network.wallet.bob.getAddress())
		expect(bobBalanceAfter.base.stable).to.be.equal(250e9)
		expect(bobBalanceAfter.base.pending).to.be.equal(0)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
