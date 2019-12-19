const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check payments', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
	})

	it('Check sending bytes', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const alice = await network.newHeadlessWallet().ready()
		const bob = await network.newHeadlessWallet().ready()

		const aliceAddress = await alice.getAddress()
		const bobAddress = await bob.getAddress()

		const { unit: unit1 } = await genesis.sendBytes({ toAddress: aliceAddress, amount: 100000 })
		await network.sync()

		let aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.pending).to.be.equal(100000)

		await network.witnessUntilStable(unit1)

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.stable).to.be.equal(100000)

		const { unit: unit2 } = await alice.sendBytes({ toAddress: bobAddress, amount: 50000 })
		await network.sync()

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.pending).to.be.equal(49401)

		let bobBalance = await bob.getBalance()
		expect(bobBalance.base.pending).to.be.equal(50000)

		await network.witnessUntilStable(unit2)

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.stable).to.be.equal(49756)

		bobBalance = await bob.getBalance()
		expect(bobBalance.base.stable).to.be.equal(50000)

		const { unit: unit3 } = await genesis.sendBytes({ toAddress: aliceAddress, amount: 1e9 })
		await network.sync()

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.pending).to.be.equal(1000000000)
		await network.witnessUntilStable(unit3)

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.stable).to.be.equal(1000049756)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
