const { Testkit } = require('../../main')
const { Network } = Testkit()
const { uniq } = require('lodash')

describe('Check default number of witnesses for network started without NetworkInitializer', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.run()
	})

	it('Check network has 3 different witness nodes(including genesis node)', async () => {
		const witnesses = this.network.nodes.witnesses
		expect(witnesses.length).to.be.equal(2)

		const addresses = await Promise.all([...witnesses, this.network.genesisNode].map(n => n.getAddress()))
		expect(uniq(addresses).length).to.be.equal(3)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
