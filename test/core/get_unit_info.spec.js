const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Get unit info feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create().run()
	})

	it('Check getUnitInfo', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const wallet = await network.newHeadlessWallet().ready()

		const walletAddress = await wallet.getAddress()

		const { unit } = await genesis.sendBytes({ toAddress: walletAddress, amount: 100000 })
		await network.witnessUntilStable(unit)

		const { unitObj, error } = await wallet.getUnitInfo({ unit })

		expect(error).to.be.null

		expect(unitObj).to.have.property('unit', unit)
		expect(unitObj).to.have.property('main_chain_index')

		expect(unitObj).to.have.keys([
			'alt',
			'unit',
			'version',
			'authors',
			'messages',
			'timestamp',
			'last_ball',
			'parent_units',
			'last_ball_unit',
			'main_chain_index',
			'witness_list_unit',
			'headers_commission',
			'payload_commission',
		])
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
