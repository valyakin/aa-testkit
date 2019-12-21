const { Testkit } = require('../../main')
const { Network, Utils } = Testkit()

describe('Response unit has only these payments', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
		const genesis = await this.network.getGenesisNode().ready()
		this.sender = await this.network.newHeadlessWallet().ready()
		
		const { unit } = await genesis.sendBytes({ toAddress: await this.sender.getAddress(), amount: 1e9 })
		await this.network.witnessUntilStable(unit)

	})

	it('one base payment matches', async () => {
		const { unit } = await this.sender.sendBytes({ toAddress: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", amount: 185513 })
		const { unitObj, error } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)

		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		}])).to.be.true
	})

	it('expected one less base payment - 1', async () => {

		const { unit ,error } = await this.sender.sendMulti({ 
			base_outputs: [{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			},{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			}],
			change_address: await this.sender.getAddress()
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		}])).to.be.false
	})

	it('expected one less base payment - 2', async () => {

		const { unit ,error } = await this.sender.sendMulti({ 
			base_outputs: [{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			},{
				address: "3W43U3SHKBVDUP7T7YOJOY5NM353HA5C", 
				amount: 1855138 
			}],
			change_address: await this.sender.getAddress()
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		}])).to.be.false
	})

	it('two base payments matches - 1', async () => {

		const { unit } = await this.sender.sendMulti({ 
			base_outputs: [{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			},{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			}],
			change_address: await this.sender.getAddress()
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		},{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		}])).to.be.true
	})

	it('two base payments matches - 2', async () => {

		const { unit } = await this.sender.sendMulti({ 
			base_outputs: [{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			},{
				address: "3W43U3SHKBVDUP7T7YOJOY5NM353HA5C", 
				amount: 1855138 
			}],
			change_address: await this.sender.getAddress()
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		},{
			address: "3W43U3SHKBVDUP7T7YOJOY5NM353HA5C",
			amount: 1855138
		}])).to.be.true
	})

	it('two base payments matches - 3', async () => {

		const { unit } = await this.sender.sendMulti({ 
			base_outputs: [{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513
			},{
				address: "3W43U3SHKBVDUP7T7YOJOY5NM353HA5C", 
				amount: 1855138 
			}],
			change_address: await this.sender.getAddress()
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513,
			asset: 'base'
		},{
			address: "3W43U3SHKBVDUP7T7YOJOY5NM353HA5C",
			amount: 1855138
		}])).to.be.true
	})

	it('expected one more base payment - 1', async () => {

		const { unit } = await this.sender.sendMulti({ 
			base_outputs: [{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			}],
			change_address: await this.sender.getAddress()
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		},{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		}])).to.be.false
	})


	it('expected one more asset payment - 2', async () => {

		const { unit } = await this.sender.sendMulti({ 
			base_outputs: [{
				address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI", 
				amount: 185513 
			}],
			change_address: await this.sender.getAddress()
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(	Utils.hasResponseUnitOnlyThesePayments(unitObj, [{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513
		},{
			address: "WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI",
			amount: 185513,
			asset: "LEZs/hW7YDPD0TwkplMSI11UveaFuZ3qI8WxG/fdOps="
		}])).to.be.false
	})

	after(async () => {
		await this.network.stop()
	})
})
