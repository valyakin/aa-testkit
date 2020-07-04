const { Testkit } = require('../../main')
const { Network, Utils } = Testkit()

describe('Get response unit external payments', function () {
	this.timeout(60000)

	const mockAddress1 = 'WDZZ6AGCHI5HTS6LJD3LYLPNBWZ72DZI'
	const mockAddress2 = '3W43U3SHKBVDUP7T7YOJOY5NM353HA5C'

	before(async () => {
		this.network = await Network.create().run()
		const genesis = await this.network.getGenesisNode().ready()
		this.sender = await this.network.newHeadlessWallet().ready()

		const { unit } = await genesis.sendBytes({ toAddress: await this.sender.getAddress(), amount: 1e9 })
		await this.network.witnessUntilStable(unit)

		this.asset_1 = (await this.sender.createAsset({
			is_private: false,
			is_transferrable: true,
			auto_destroy: false,
			issued_by_definer_only: true,
			cosigned_by_definer: false,
			spender_attested: false,
			fixed_denominations: false,
		})).unit
		await this.network.witnessUntilStable(this.asset_1)
	})

	it('one base payment match', async () => {
		const { unit } = await this.sender.sendBytes({ toAddress: mockAddress1, amount: 185513 })
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)

		expect(Utils.getExternalPayments(unitObj)).to.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('one asset payment match', async () => {
		const { unit } = await this.sender.sendMulti({
			asset_outputs: [{
				address: mockAddress1,
				amount: 80006,
			}],
			change_address: await this.sender.getAddress(),
			asset: this.asset_1,
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 80006,
			asset: this.asset_1,
		}])
	})

	it('two asset two base payment match', async () => {
		const { unit } = await this.sender.sendMulti({
			asset_outputs: [{
				address: mockAddress1,
				amount: 80006,
			}, {
				address: mockAddress2,
				amount: 3806,
			}],
			base_outputs: [{
				address: mockAddress2,
				amount: 1875513,
			}, {
				address: mockAddress1,
				amount: 185513,
			}],
			change_address: await this.sender.getAddress(),
			asset: this.asset_1,
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 80006,
			asset: this.asset_1,
		}, {
			address: mockAddress2,
			amount: 3806,
			asset: this.asset_1,
		}, {
			address: mockAddress2,
			amount: 1875513,
		}, {
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('expected one less base payment - 1', async () => {
		const { unit } = await this.sender.sendMulti({
			base_outputs: [{
				address: mockAddress1,
				amount: 185513,
			}, {
				address: mockAddress1,
				amount: 185513,
			}],
			change_address: await this.sender.getAddress(),
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('expected one less base payment - 2', async () => {
		const { unit } = await this.sender.sendMulti({
			base_outputs: [{
				address: mockAddress1,
				amount: 185513,
			}, {
				address: mockAddress2,
				amount: 1855138,
			}],
			change_address: await this.sender.getAddress(),
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('expected one less asset payment', async () => {
		const { unit } = await this.sender.sendMulti({
			asset_outputs: [{
				address: mockAddress1,
				amount: 80006,
			}, {
				address: mockAddress2,
				amount: 3806,
			}],
			base_outputs: [{
				address: mockAddress2,
				amount: 1875513,
			}, {
				address: mockAddress1,
				amount: 185513,
			}],
			change_address: await this.sender.getAddress(),
			asset: this.asset_1,
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 80006,
			asset: this.asset_1,
		}, {
			address: mockAddress2,
			amount: 1875513,
		}, {
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('two base payments match - 1', async () => {
		const { unit } = await this.sender.sendMulti({
			base_outputs: [{
				address: mockAddress1,
				amount: 185513,
			}, {
				address: mockAddress1,
				amount: 185513,
			}],
			change_address: await this.sender.getAddress(),
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}, {
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('two base payments match - 2', async () => {
		const { unit } = await this.sender.sendMulti({
			base_outputs: [{
				address: mockAddress1,
				amount: 185513,
			}, {
				address: mockAddress2,
				amount: 1855138,
			}],
			change_address: await this.sender.getAddress(),
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}, {
			address: mockAddress2,
			amount: 1855138,
		}])
	})

	it('two base payments match - 3', async () => {
		const { unit } = await this.sender.sendMulti({
			base_outputs: [{
				address: mockAddress1,
				amount: 185513,
			}, {
				address: mockAddress2,
				amount: 1855138,
			}],
			change_address: await this.sender.getAddress(),
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}, {
			address: mockAddress2,
			amount: 1855138,
		}])
	})

	it('expected one more base payment - 1', async () => {
		const { unit } = await this.sender.sendMulti({
			base_outputs: [{
				address: mockAddress1,
				amount: 185513,
			}],
			change_address: await this.sender.getAddress(),
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}, {
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('expected one more asset payment - 2', async () => {
		const { unit } = await this.sender.sendMulti({
			base_outputs: [{
				address: mockAddress1,
				amount: 185513,
			}],
			change_address: await this.sender.getAddress(),
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 185513,
		}, {
			address: mockAddress1,
			amount: 185513,
			asset: 'LEZs/hW7YDPD0TwkplMSI11UveaFuZ3qI8WxG/fdOps=',
		}])
	})

	it('expect less payments than in Response', async () => {
		const { unit } = await this.sender.sendMulti({
			asset_outputs: [{
				address: mockAddress1,
				amount: 80006,
			}, {
				address: mockAddress2,
				amount: 3806,
			}],
			base_outputs: [{
				address: mockAddress2,
				amount: 1875513,
			}, {
				address: mockAddress1,
				amount: 185513,
			}],
			change_address: await this.sender.getAddress(),
			asset: this.asset_1,
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)
		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress2,
			amount: 3806,
			asset: this.asset_1,
		}, {
			address: mockAddress2,
			amount: 1875513,
		}, {
			address: mockAddress1,
			amount: 185513,
		}])
	})

	it('send asset and base, expect has asset only', async () => {
		const { unit } = await this.sender.sendMulti({
			asset_outputs: [{
				address: mockAddress1,
				amount: 90000,
			}],
			base_outputs: [{
				address: mockAddress1,
				amount: 200000,
			}],
			change_address: await this.sender.getAddress(),
			asset: this.asset_1,
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)

		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 90000,
			asset: this.asset_1,
		}])
	})

	it('send asset and base, expect has base only', async () => {
		const { unit } = await this.sender.sendMulti({
			asset_outputs: [{
				address: mockAddress1,
				amount: 90000,
			}],
			base_outputs: [{
				address: mockAddress1,
				amount: 200000,
			}],
			change_address: await this.sender.getAddress(),
			asset: this.asset_1,
		})
		const { unitObj } = await this.sender.getUnitInfo({ unit })
		await this.network.witnessUntilStable(unit)

		expect(Utils.getExternalPayments(unitObj)).to.not.deep.equalInAnyOrder([{
			address: mockAddress1,
			amount: 200000,
		}])
	})

	after(async () => {
		await this.network.stop()
	})
})
