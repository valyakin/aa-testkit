const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check NetworkInitializer with function (everything together)', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.with.asset({ notrealmoney: {} })
			.with.asset({
				someassetname: {
					cap: 16000,
					is_private: true,
					is_transferrable: true,
					auto_destroy: true,
					issued_by_definer_only: true,
					cosigned_by_definer: false,
					spender_attested: false,
					fixed_denominations: true,
					denominations: [
						{ denomination: 1, count_coins: 1000 },
						{ denomination: 5, count_coins: 1000 },
						{ denomination: 10, count_coins: 1000 },
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

	it('Check asset someassetname is valid unit', async () => {
		expect(this.network.asset.someassetname).to.be.validUnit
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
