const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check `mnemonic` option for headless wallet', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.run()
	})

	it('Check waitForUnit node method', async () => {
		const alice = await this.network.newHeadlessWallet({
			mnemonic: 'assume anchor idle muscle hub junior sniff shy anxiety fantasy scan hill',
		}).ready()

		expect(await alice.getAddress()).to.be.validAddress
		expect(await alice.getAddress()).to.be.equal('QMWQRJV6NCYGUI6X7BWRKLLBQVQYLZ27')
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
