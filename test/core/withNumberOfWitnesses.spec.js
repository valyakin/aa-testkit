const { Testkit } = require('../../main')
const { Network } = Testkit()
const { uniq } = require('lodash')

describe('Check .with.numberOfWitnesses explicitly set', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.with.numberOfWitnesses(5)
			.run()
	})

	it('Check network has 5 different witness nodes(including genesis node)', async () => {
		const witnesses = this.network.nodes.witnesses
		expect(witnesses.length).to.be.equal(4)

		const addresses = await Promise.all([...witnesses, this.network.genesisNode].map(n => n.getAddress()))
		expect(uniq(addresses).length).to.be.equal(5)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
