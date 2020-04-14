const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check network.witnessUntilStable function', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
	})

	it('Check witnessUntilStable on 10 nodes', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const wallets = await Promise.all([
			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),

			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),
			network.newHeadlessWallet().ready(),
		])

		await Promise.all(wallets.map(async w => genesis.sendBytes({ toAddress: await w.getAddress(), amount: 1e4 })))

		const { unit, error } = await genesis.sendBytes({ toAddress: await wallets[0].getAddress(), amount: 1e4 })
		expect(error).to.be.null
		expect(unit).to.be.validUnit

		await network.witnessUntilStable(unit)

		for (const w of wallets) {
			const { unitProps: props } = await w.getUnitProps({ unit })
			expect(props.is_stable).to.be.equal(1)
		}
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
