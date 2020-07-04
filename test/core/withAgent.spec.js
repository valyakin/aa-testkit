const path = require('path')
const { Testkit } = require('../../main')
const { Network } = Testkit()
const { justABouncer } = require('../aa/agents')

describe('Check NetworkInitializer with agent function', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.with.agent({ plaintext: path.join(__dirname, './files/bouncer.oscript') })
			.with.agent({ fromjs: justABouncer })
			.run()
	})

	it('Check deployer is accessible', async () => {
		expect(this.network.deployer).is.not.null
	}).timeout(30000)

	it('Check agent bouncer has address', async () => {
		expect(this.network.agent.plaintext).to.be.validAddress
	}).timeout(30000)

	it('Check agent fromjs has address', async () => {
		expect(this.network.agent.fromjs).to.be.validAddress
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
