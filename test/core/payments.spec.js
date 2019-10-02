require('../../require')
const chai = require('chai')
const Network = requireRoot('src/networks')
const expect = chai.expect

describe('Check payments', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.genesis()
	})

	it('Check sending bytes', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()

		const alice = await network.newHeadlessWallet().ready()
		const bob = await network.newHeadlessWallet().ready()

		const aliceAddress = await alice.getAddress()
		const bobAddress2 = await bob.getAddress()

		await genesis.sendBytes({ toAddress: aliceAddress, amount: 100000 })
		let aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.pending).to.be.equal(100000)

		await network.witnessAndStabilize()

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.stable).to.be.equal(100000)

		await alice.sendBytes({ toAddress: bobAddress2, amount: 50000 })

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.pending).to.be.equal(49401)

		let bobBalance = await bob.getBalance()
		expect(bobBalance.base.pending).to.be.equal(50000)

		await network.witnessAndStabilize()
		await network.witnessAndStabilize()

		aliceBalance = await alice.getBalance()
		expect(aliceBalance.base.stable).to.be.equal(49756)

		bobBalance = await bob.getBalance()
		expect(bobBalance.base.stable).to.be.equal(50000)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
