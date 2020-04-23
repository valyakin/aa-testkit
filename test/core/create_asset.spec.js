const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check asset creation feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create().run()
		this.genesis = await this.network.getGenesisNode().ready()
		this.creator = await this.network.newHeadlessWallet().ready()

		const address = await this.creator.getAddress()
		const { unit, error } = await this.genesis.sendBytes({ toAddress: address, amount: 1e9 })

		expect(unit).to.be.string
		expect(error).to.be.null
		await this.network.witnessUntilStable(unit)
	})

	it('create asset no params', async () => {
		const { error } = await this.creator.createAsset()
		expect(error).to.be.string('asset definition should be an object')
	}).timeout(30000)

	it('create asset missing field', async () => {
		const { error } = await this.creator.createAsset({
			is_transferrable: true,
			auto_destroy: false,
			issued_by_definer_only: true,
			cosigned_by_definer: false,
			spender_attested: false,
			fixed_denominations: false,
		})
		expect(error).to.be.string('some required fields in asset definition are missing')
	}).timeout(30000)

	it('create asset unknown field', async () => {
		const { error } = await this.creator.createAsset({
			is_private: false,
			is_transferrable: true,
			unknown_field: true,
			auto_destroy: false,
			issued_by_definer_only: true,
			cosigned_by_definer: false,
			spender_attested: false,
			fixed_denominations: false,
		})
		expect(error).to.be.string('unknown fields in asset definition')
	}).timeout(30000)

	it('create asset success', async () => {
		const { error, unit } = await this.creator.createAsset({
			is_private: false,
			is_transferrable: true,
			auto_destroy: false,
			issued_by_definer_only: true,
			cosigned_by_definer: false,
			spender_attested: false,
			fixed_denominations: false,
		})
		expect(error).to.be.null
		expect(unit).to.be.validUnit
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
