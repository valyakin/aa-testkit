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

	it('Check non-serials & double spends', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()
		const genesisAddress = await genesis.getAddress()

		const alice = await network.newHeadlessWallet().ready()
		const aliceAddress = await alice.getAddress()
		const bob = await network.newHeadlessWallet().ready()
		const bobAddress = await bob.getAddress()
		console.log('Alice: ', aliceAddress, '\nBob: ', bobAddress)

		const { unit: aliceInputUnit1 } = await genesis.sendBytes({ toAddress: aliceAddress, amount: 100000 })
		const { unit: aliceInputUnit2 } = await genesis.sendBytes({ toAddress: aliceAddress, amount: 99000 })
		const { unit: bobInputUnit } = await genesis.sendBytes({ toAddress: bobAddress, amount: 111000 })
		await network.witnessUntilStable(bobInputUnit)
		// revel definition
		const { unit: aliceInputUnit3, error: err } = await alice.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 0,
						unit: aliceInputUnit1,
					},
				],
				input_amount: 100000,
				outputs: [
					{ address: aliceAddress, amount: 0 },
				],
			},
			saveJoint: true,
			broadcastJoint: true,
		})
		await network.witnessUntilStable(aliceInputUnit3)

		await timeout(1)

		// non-serials
		const aliceUnit1 = await alice.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 0,
						unit: aliceInputUnit3,
					},
				],
				input_amount: 99225,
				outputs: [
					{ address: aliceAddress, amount: 0 },
				],
			},
			saveJoint: false,
			broadcastJoint: true,
		})

		await timeout(1)

		const bobUnit1 = await bob.composeJoint({
			opts: {
				outputs: [{ address: bobAddress, amount: 0 }],
			},
			saveJoint: true,
			broadcastJoint: true,
		})

		const aliceUnit2 = await alice.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 0,
						unit: aliceInputUnit2,
					},
				],
				input_amount: 99000,
				outputs: [
					{ address: aliceAddress, amount: 0 },
				],
			},
			saveJoint: true,
			broadcastJoint: true,
		})

		// non-serial double spends
		const dsAliceUnit = await alice.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 0,
						unit: aliceInputUnit3,
					},
				],
				input_amount: 99225,
				outputs: [
					{ address: bobAddress, amount: 90000 },
					{ address: aliceAddress, amount: 0 },
				],
			},
			saveJoint: true,
			broadcastJoint: true,
		})

		setInterval(function () {
			// genesis.postWitness()
		}, 5 * 1000)
	}).timeout(30000 * 1000)

	after(async () => {
		// await this.network.stop()
	})
})
