const chai = require('chai')
const expect = chai.expect
const { Network } = require('./kit')

const MyNode = require('./MyNode')

describe('Check custom node work with user provided api', function () {
	this.timeout(120000)

	before(async () => {
		this.network = await Network.create()
			.with.custom(MyNode, { alice: 100e9 })
			.run()
	})

	it('Check chash api', async () => {
		const chash = await this.network.custom.alice.getChash('123')

		expect(chash).to.be.equal('MSSCC7D6OKOFWTM3764GJG4EAUQJ25BZ')
	}).timeout(60000)

	it('Check my witnesses api', async () => {
		const witnesses = await this.network.custom.alice.getMyWitnesses()
		expect(witnesses).to.be.an('array')
		expect(witnesses).to.have.length(3)

		for (const w of witnesses) {
			expect(w).to.be.validAddress
		}
	}).timeout(60000)

	after(async () => {
		await this.network.stop()
	})
})
