const path = require('path')
const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Verify signed package', function () {
	this.timeout(120 * 1000)

	before(async () => {
		this.network = await Network.create()
			.with.agent({ aa: path.join(__dirname, './agents/lib/verify_signed_package.aa') })
			.with.wallet({ alice: 1e9 })
			.with.wallet({ bob: 1e9 })
			.run()
	})

	it('Test signature OK', async () => {
		const { signedPackage } = await this.network.wallet.bob.signMessage({ text: "I'm bob" })
		const { unit, error } = await this.network.wallet.bob.triggerAaWithData({
			toAddress: this.network.agent.aa,
			amount: 10000,
			data: {
				signedPackage,
			},
		})
		expect(error).to.be.null
		expect(unit).to.be.validUnit

		const { response } = await this.network.getAaResponseToUnit(unit)
		expect(response.response.error).to.be.undefined
		expect(response.bounced).to.be.false
		expect(response.response_unit).to.be.null

		expect(response.response.responseVars.status).to.be.equal('signature ok')
	}).timeout(15000)

	it('Test wrong signature', async () => {
		const { signedPackage } = await this.network.wallet.alice.signMessage({ text: "I'm alice" })
		const { unit, error } = await this.network.wallet.bob.triggerAaWithData({
			toAddress: this.network.agent.aa,
			amount: 10000,
			data: {
				signedPackage,
			},
		})
		expect(error).to.be.null
		expect(unit).to.be.validUnit

		const { response } = await this.network.getAaResponseToUnit(unit)
		expect(response.response.error).to.be.equal('invalid signature')
		expect(response.bounced).to.be.true
	}).timeout(15000)

	after(async () => {
		await this.network.stop()
	})
})
