const chai = require('chai')
const expect = chai.expect
const { Network } = require('./kit')

const MyNode = require('./MyNode')

describe('Check headless wallet functions of custom node', function () {
	this.timeout(120000)

	before(async () => {
		this.network = await Network.create()
			.with.custom(MyNode, { alice: 100e9 })
			.with.custom(MyNode, { bob: 0 })
			.run()
	})

	it('Check getAddress', async () => {
		const address = await this.network.custom.alice.getAddress()
		expect(address).to.be.validAddress
	}).timeout(60000)

	it('Check getAddress', async () => {
		const address = await this.network.custom.bob.getAddress()
		expect(address).to.be.validAddress
	}).timeout(60000)

	it('Check sendBytes', async () => {
		const { unit, error } = await this.network.custom.alice.sendBytes({
			amount: 50e8,
			toAddress: await this.network.custom.bob.getAddress(),
		})

		expect(error).to.be.null
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)

		const balance = await this.network.custom.bob.getBalance()
		expect(balance.base.stable).to.be.equal(50e8)
	}).timeout(60000)

	after(async () => {
		await this.network.stop()
	})
})
