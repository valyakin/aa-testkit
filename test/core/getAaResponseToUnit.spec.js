// const { Testkit } = require('../../main')
// const { Network } = Testkit()

// describe('Check getAaResponseToUnit function', function () {
// 	this.timeout(60000)

// 	before(async () => {
// 		this.network = await Network.create()
// 			.with.wallet({ alice: 1e6 })
// 			.run()
// 	})

// 	it('Check witnessUntilStableOnNode', async () => {
// 		// const network = this.network
// 		// const genesis = await network.getGenesisNode().ready()

// 		// const alice = await network.newHeadlessWallet().ready()
// 		// const aliceAddress = await alice.getAddress()

// 		// const { unit: unit1 } = await genesis.sendBytes({ toAddress: aliceAddress, amount: 100000 })
// 		// await network.witnessUntilStableOnNode(alice, unit1)

// 		// const { unitProps } = await alice.getUnitProps({ unit: unit1 })
// 		// expect(unitProps.is_stable).to.be.equal(1)
// 	}).timeout(30000)

// 	after(async () => {
// 		await this.network.stop()
// 	})
// })
