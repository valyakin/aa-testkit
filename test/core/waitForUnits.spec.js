const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check waitForUnit and waitForUnits node feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.with.wallet({ alice: 1e6 })
			.with.wallet({ bob: 1e6 })
			.with.wallet({ eva: 1e6 })
			.run()
	})

	it('Check waitForUnit node method', async () => {
		const { unit } = await this.network.getGenesisNode().sendBytes({ toAddress: await this.network.wallet.alice.getAddress(), amount: 1e5 })
		expect(unit).to.be.validUnit

		const infoBefore = await this.network.wallet.alice.getUnitInfo({ unit })
		expect(infoBefore.unitObj).to.be.null
		expect(infoBefore.error).to.be.equal('Unit not found')

		await this.network.wallet.alice.waitForUnit(unit)

		const infoAfter = await this.network.wallet.alice.getUnitInfo({ unit })
		expect(infoAfter.error).to.be.null
		expect(infoAfter.unitObj).to.be.an('object')
	}).timeout(30000)

	it('Check waitForUnits node method', async () => {
		const { unit: unit1 } = await this.network.getGenesisNode().sendBytes({ toAddress: await this.network.wallet.alice.getAddress(), amount: 1e5 })
		expect(unit1).to.be.validUnit
		const { unit: unit2 } = await this.network.getGenesisNode().sendBytes({ toAddress: await this.network.wallet.bob.getAddress(), amount: 1e5 })
		expect(unit2).to.be.validUnit
		const { unit: unit3 } = await this.network.getGenesisNode().sendBytes({ toAddress: await this.network.wallet.eva.getAddress(), amount: 1e5 })
		expect(unit3).to.be.validUnit

		const units = [unit1, unit2, unit3]

		await this.network.wallet.alice.waitForUnits(units)

		for (const unit of units) {
			const info = await this.network.wallet.alice.getUnitInfo({ unit })
			expect(info.error).to.be.null
			expect(info.unitObj).to.be.an('object')
		}
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
