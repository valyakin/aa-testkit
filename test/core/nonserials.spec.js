const { Testkit } = require('../../main')
const { Network } = Testkit()

const timeout = async x => {
	return new Promise(
		resolve => { setTimeout(resolve, x * 1000) },
	)
}

describe('Check nonserials', function () {
	this.timeout(60000 * 1000)

	before(async () => {
		// witness address: HGNAASJCOVTLUDXYMIDJT7A5G2LW5B4X
		// genesis unit: WRiTZuIkGOtaiGEJD9g2XXGZBhi2fYDFttHeLSs8XdA=
		this.network = await Network.create({ mnemonic: 'order lunch sick broom plastic version citizen side eager raw work cluster' })
			.with.explorer()
			.with.numberOfWitnesses(1)
			.run()
	})

	it('Check sending bytes', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()
		const genesisAddress = await genesis.getAddress()

		const alice = await network.newHeadlessWallet().ready()
		const aliceAddress = await alice.getAddress()
		const bob = await network.newHeadlessWallet().ready()
		const bobAddress = await bob.getAddress()

		await genesis.sendBytes({ toAddress: aliceAddress, amount: 100000 })
		const { unit } = await genesis.sendBytes({ toAddress: bobAddress, amount: 100000 })
		await network.sync()
		await network.witnessUntilStable(unit)

		await alice.composeJoint({
			opts: {
				outputs: [{ address: aliceAddress, amount: 0 }],
			},
			saveJoint: false,
			broadcastJoint: true,
		})
		await timeout(1)
		alice.composeJoint({
			opts: {
				outputs: [
					{ address: genesisAddress, amount: 1 },
					{ address: aliceAddress, amount: 0 },
				],
			},
			saveJoint: true,
			broadcastJoint: true,
		})
		await bob.composeJoint({
			opts: {
				outputs: [{ address: bobAddress, amount: 0 }],
			},
			saveJoint: true,
			broadcastJoint: true,
		})
		await genesis.postWitness()

		setInterval(function () {
			genesis.postWitness()
		}, 3 * 1000)
	}).timeout(30000 * 1000)

	after(async () => {
		// await this.network.stop()
	})
})
