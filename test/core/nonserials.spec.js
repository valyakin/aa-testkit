const { Testkit } = require('../../main')
const { Network } = Testkit()
const ObjectHash = require('ocore/object_hash')

describe('Check nonserials', function () {
	this.timeout(60000 * 1000)
	const timeout = async x => {
		return new Promise(
			resolve => { setTimeout(resolve, x * 1000) },
		)
	}

	before(async () => {
		// witness address: GM2YA62K6DWSJPI6GTMO22DPPYMOB6CL
		// genesis unit: A1N9KyyDdKq9vhUPVESmIwzrZMb3V+wKyMpOdbNO/QM=
		this.network = await Network.create({ mnemonic: 'mass work afraid spy traffic popular clinic grain child firm grass engage' })
			// .with.explorer()
			.with.numberOfWitnesses(1)
			.run()
		this.genesis = await this.network.getGenesisNode().ready()
		this.hub = await this.network.getHub().ready()
		// Alice:  EIG3XRMMGUH6TUW7VZXRV7XVJWAR4J34
		this.alice = await this.network.newHeadlessWallet({ mnemonic: 'peace length ugly acquire fade boss accident river front visit cause example' }).ready()
		// Bob:  ATF2KRFTEA75HQ3MFUKOSUY624OBWEMU
		this.bob = await this.network.newHeadlessWallet({ mnemonic: 'make fun cherry catalog claw music spare employ boil exile video fetch' }).ready()
		// Charlie: NPFSZWYDFYBXDAJJQLKOTWWD4HIMH4JB
		this.charlie = await this.network.newHeadlessWallet({ mnemonic: 'negative wheat hint flee wagon young hood connect crop grief weekend few' }).ready()
	})

	it('Check non-serials & double spends', async () => {
		const aliceAddress = await this.alice.getAddress()
		const bobAddress = await this.bob.getAddress()
		const charlieAddress = await this.charlie.getAddress()

		const { unit: aliceInputUnit1 } = await this.genesis.sendBytes({ toAddress: aliceAddress, amount: 100000 })
		const { unit: aliceInputUnit2 } = await this.genesis.sendBytes({ toAddress: aliceAddress, amount: 99000 })
		await this.genesis.sendBytes({ toAddress: bobAddress, amount: 111000 })
		const { unit: charlieInputUnit } = await this.genesis.sendBytes({ toAddress: charlieAddress, amount: 112000 })
		// reveal definitions so it won't be revealed two times in non-serials
		const { unit: aliceInputUnit3 } = await this.alice.composeJoint({
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
		const { unit: charlieInputUnit2 } = await this.charlie.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 1,
						unit: charlieInputUnit,
					},
				],
				input_amount: 112000,
				outputs: [
					{ address: charlieAddress, amount: 0 },
				],
			},
			saveJoint: true,
			broadcastJoint: true,
		})
		await this.network.witnessUntilStable(charlieInputUnit2.unit)
		// serial double spend, hub will broadcast it to all peers
		// all nodes should discard it every time
		const { unit: dsAliceUnit1 } = await this.alice.composeJoint({
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
			saveJoint: false,
			broadcastJoint: false,
		})
		this.hub.broadcastJoint({ unit: dsAliceUnit1 })
		// non-serial units
		// winner unit
		const { unit: aliceUnit1 } = await this.alice.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 0,
						unit: aliceInputUnit3.unit,
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
		// wait for bob to receive aliceUnit1
		await this.bob.waitForUnits([aliceUnit1.unit])
		// bob unit 1 on top of winner unit
		await this.bob.composeJoint({
			opts: {
				outputs: [{ address: bobAddress, amount: 0 }],
			},
			saveJoint: true,
			broadcastJoint: true,
		})
		const { unitProps: aliceUnit1Props } = await this.bob.getUnitProps({ unit: aliceUnit1.unit })
		expect(aliceUnit1Props.sequence).to.be.equal('good')
		// loser non-serial unit (as it won't have good children)
		const { unit: aliceUnit2 } = await this.alice.composeJoint({
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
		// non-serial double spend on top of non-serial unit
		const { unit: dsAliceUnit } = await this.alice.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 0,
						unit: aliceInputUnit3.unit,
					},
				],
				input_amount: 99225,
				outputs: [
					{ address: aliceAddress, amount: 0 },
					{ address: charlieAddress, amount: 90000 },
				],
			},
			saveJoint: true,
			broadcastJoint: true,
		})
		await this.charlie.waitForUnits([dsAliceUnit.unit])
		// charlie unit spending dsAliceUnit (non-serial double spend) with parent being bobUnit1, should be discarded by all nodes as the input unit is not included in parents
		const { unit: charlieUnit1 } = await this.charlie.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 1,
						unit: dsAliceUnit.unit,
					},
				],
				input_amount: 90000,
				outputs: [
					{ address: charlieAddress, amount: 0 },
				],
			},
			saveJoint: false,
			broadcastJoint: false,
		})
		// now prepare good unit from charlie, spending valid input on top of prev charlie's temp-bad
		const { unit: charlieUnit2 } = await this.charlie.composeJoint({
			opts: {
				inputs: [
					{
						message_index: 0,
						output_index: 0,
						unit: charlieInputUnit2.unit,
					},
				],
				input_amount: 111225,
				outputs: [
					{ address: charlieAddress, amount: 0 },
				],
			},
			saveJoint: false,
			broadcastJoint: false,
		})

		this.hub.broadcastJoint({ unit: charlieUnit1 })
		await timeout(0.5) // unit is discarded, nothing to wait for
		const { unitProps: charlieUnit1Props } = await this.genesis.getUnitProps({ unit: charlieUnit1.unit })
		expect(charlieUnit1Props).to.be.empty
		// now replace parent in charlieUnit1 to make it a child of dsAliceUnit, so both input and parent point to it, making it look like charlie doesn't know anything about other branch with bobUnit1, still temp-bad because it spends temp-bad unit
		charlieUnit1.parent_units = [dsAliceUnit.unit]
		const { unit: charlieUnit1Fixed } = await this.charlie.signUnit(charlieUnit1)
		charlieUnit1Fixed.unit = ObjectHash.getUnitHash(charlieUnit1Fixed)
		this.hub.broadcastJoint({ unit: charlieUnit1Fixed })
		await this.genesis.waitForUnits([charlieUnit1Fixed.unit])
		const { unitProps: charlieUnit1FixedProps } = await this.genesis.getUnitProps({ unit: charlieUnit1Fixed.unit })
		expect(charlieUnit1FixedProps.sequence).to.be.equal('temp-bad')

		const { unitProps: aliceUnit1Props2 } = await this.genesis.getUnitProps({ unit: aliceUnit1.unit })
		expect(aliceUnit1Props2.sequence).to.be.equal('temp-bad')

		// now send charlieUnit2, fixing it parents first
		charlieUnit2.parent_units = [charlieUnit1Fixed.unit]
		const { unit: charlieUnit2Fixed } = await this.charlie.signUnit(charlieUnit2)
		charlieUnit2Fixed.unit = ObjectHash.getUnitHash(charlieUnit2Fixed)
		this.hub.broadcastJoint({ unit: charlieUnit2Fixed })
		await this.genesis.waitForUnits([charlieUnit2Fixed.unit])
		await this.genesis.postWitness()
		await this.genesis.postWitness()
		const { unitProps: aliceUnit1Props3 } = await this.genesis.getUnitProps({ unit: aliceUnit1.unit })
		expect(aliceUnit1Props3.sequence).to.be.equal('good')
		const { unitProps: aliceUnit2Props } = await this.genesis.getUnitProps({ unit: aliceUnit2.unit })
		expect(aliceUnit2Props.sequence).to.be.equal('final-bad')
		const { unitProps: charlieUnit1FixedProps2 } = await this.genesis.getUnitProps({ unit: charlieUnit1Fixed.unit })
		expect(charlieUnit1FixedProps2.sequence).to.be.equal('final-bad')
		const { unitProps: charlieUnit2FixedProps } = await this.genesis.getUnitProps({ unit: charlieUnit2Fixed.unit })
		expect(charlieUnit2FixedProps.sequence).to.be.equal('good')
	}).timeout(30000 * 1000)

	after(async () => {
		await this.network.stop()
	})
})
