const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check NetworkInitializer with.wallet function', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
		await this.network
			.with.asset({ notrealmoney: {} })
			.with.wallet({ alice: 1e6 })
			.with.wallet({ bob: { base: 1000 } })
			.with.wallet({ eva: { base: 1e9, notrealmoney: 1e9 } })
			.run()
	})

	it('Check deployer is accessible', async () => {
		expect(this.network.deployer).is.not.null
	}).timeout(30000)

	it('Check wallet alice is accessible and has correct balance', async () => {
		expect(this.network.wallet.alice).is.not.null
		const balance = await this.network.wallet.alice.getBalance()
		expect(balance.base.pending).to.be.equal(0)
		expect(balance.base.stable).to.be.equal(1e6)
	}).timeout(30000)

	it('Check wallet bob is accessible and has correct balance', async () => {
		expect(this.network.wallet.bob).is.not.null
		const balance = await this.network.wallet.bob.getBalance()
		expect(balance.base.pending).to.be.equal(0)
		expect(balance.base.stable).to.be.equal(1000)
	}).timeout(30000)

	it('Check wallet eva is accessible and has correct balance', async () => {
		expect(this.network.wallet.eva).is.not.null
		const balance = await this.network.wallet.eva.getBalance()
		expect(balance[this.network.asset.notrealmoney].pending).to.be.equal(0)
		expect(balance[this.network.asset.notrealmoney].stable).to.be.equal(1e9)

		expect(balance.base.pending).to.be.equal(0)
		expect(balance.base.stable).to.be.equal(1e9)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
