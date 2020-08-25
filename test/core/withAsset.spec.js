const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check NetworkInitializer with asset function', function () {
	this.timeout(60000)
	before(async () => {
		this.network = await Network.create()
			.with.asset({ divisible: { cap: 1e15 } })
			.with.wallet({ alice: { base: 100e9, divisible: 100e9 } })
			.with.wallet({ bob: { base: 100e9, indivisible: 100e9 } })
			.with.asset({ notrealmoney: {} })
			.with.asset({
				indivisible: {
					cap: 1e15,
					is_private: false,
					is_transferrable: true,
					auto_destroy: true,
					issued_by_definer_only: true,
					cosigned_by_definer: false,
					spender_attested: false,
					fixed_denominations: true,
					denominations: [
						{ denomination: 1, count_coins: 1e14 },
						{ denomination: 5, count_coins: 8e13 },
						{ denomination: 10, count_coins: 5e13 },
					],
				},
			})
			.run()
	})

	it('Check deployer is accessible', async () => {
		expect(this.network.deployer).is.not.null
	}).timeout(30000)

	it('Check asset notrealmoney is valid unit', async () => {
		expect(this.network.asset.notrealmoney).to.be.validUnit
	}).timeout(30000)

	it('Check asset indivisible is valid unit', async () => {
		expect(this.network.asset.indivisible).to.be.validUnit
	}).timeout(30000)

	it('Check cap asset balance for divisible asset', async () => {
		const balance = await this.network.wallet.alice.getBalance()
		expect(balance[this.network.asset.divisible].stable).to.be.equal(100e9)
		expect(balance[this.network.asset.divisible].pending).to.be.equal(0)

		expect(balance.base.stable).to.be.equal(100e9)
		expect(balance.base.pending).to.be.equal(0)
	}).timeout(30000)

	it('Check cap asset balance for indivisible asset', async () => {
		const balance = await this.network.wallet.bob.getBalance()
		expect(balance[this.network.asset.indivisible].stable).to.be.equal(100e9)
		expect(balance[this.network.asset.indivisible].pending).to.be.equal(0)

		expect(balance.base.stable).to.be.equal(100e9)
		expect(balance.base.pending).to.be.equal(0)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
