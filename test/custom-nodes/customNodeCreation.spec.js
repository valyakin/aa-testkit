const chai = require('chai')
const expect = chai.expect
const { Network } = require('./kit')

const MyNode = require('./MyNode')

describe('Check with custom node feature', function () {
	this.timeout(120000)

	before(async () => {
		this.network = await Network.create()
			.with.asset({ money: {} })
			.with.custom(MyNode, { alice: 100e9 })
			.with.custom(MyNode, { bob: { money: 9999 } })
			.run()
	})

	it('Check alice has bytes', async () => {
		expect(this.network.custom.alice).to.be.instanceOf(MyNode)

		const balance = await this.network.custom.alice.getBalance()
		expect(balance.base.stable).to.be.equal(100e9)
	}).timeout(60000)

	it('Check bob has asset', async () => {
		expect(this.network.custom.bob).to.be.instanceOf(MyNode)

		const balance = await this.network.custom.bob.getBalance()
		expect(balance[this.network.asset.money].stable).to.be.equal(9999)
	}).timeout(60000)

	it('Create custom node without `.with`', async () => {
		const custom = await this.network.newCustomNode(MyNode).ready()

		expect(custom).to.be.instanceOf(MyNode)
	}).timeout(60000)

	after(async () => {
		await this.network.stop()
	})
})
