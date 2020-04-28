const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check NetworkInitializer with.explorer', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.with.explorer({ port: 5000 })
			.run()
	})

	it('Check explorer is accessible', async () => {
		expect(this.network.explorer).is.not.null
		const id = this.network.explorer.id
		expect(id).to.be.equal('obyte-explorer-0001')
	}).timeout(30000)

	it('Check explorer has specified port', async () => {
		expect(this.network.explorer.webPort).to.be.equal(5000)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
