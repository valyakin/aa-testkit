const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check starting of a new wallet after network run', function () {
	this.timeout(60 * 1000)

	before(async () => {
		this.network = await Network.create()
			.with.wallet({ alice: 1e6 })
			.with.numberOfWitnesses(3)
			.run()
	})

	it('Start new wallet', async () => {
		for (let i = 0; i < 15; i++) {
			await this.network.postWitnesses()
		}

		// eslint-disable-next-line no-unused-vars
		const bob = await this.network.newHeadlessWallet().ready()
		await this.network.witnessAndStabilize()
	}).timeout(30 * 1000)

	after(async () => {
		await this.network.stop()
	})
})
