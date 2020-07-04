const { Testkit } = require('../../main')
const { Network, Utils } = Testkit()

describe('Check timetravel network feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create().run()

		this.expectTimeInNodes = async (expectedTime) => {
			for (const node of this.nodes) {
				const { time } = await node.getTime()
				expect(time, `${node.id} time should be ${time}`).to.be.finite.and.approximately(expectedTime, 500)
			}
		}

		this.sendBytesAndWitness = async () => {
			const address = await this.wallet2.getAddress()
			let balance = await this.wallet2.getBalance()
			const stableBalance = balance.base.stable

			expect(balance.base.pending).to.be.equal(0)

			const { unit, error } = await this.wallet1.sendBytes({ toAddress: address, amount: 100000 })
			expect(unit).to.be.string
			expect(error).to.be.null
			await this.network.sync()

			balance = await this.wallet2.getBalance()
			expect(balance.base.pending).to.be.equal(100000)

			await this.network.witnessUntilStable(unit)
			balance = await this.wallet2.getBalance()
			expect(balance.base.pending).to.be.equal(0)
			expect(balance.base.stable).to.be.equal(stableBalance + 100000)
		}
	})

	afterEach(async () => {
		await this.sendBytesAndWitness()
	})

	it('Create network', async () => {
		this.genesis = await this.network.getGenesisNode().ready()
		this.wallet1 = await this.network.newHeadlessWallet().ready()
		this.wallet2 = await this.network.newHeadlessWallet().ready()
		this.hub = await this.network.getHub().ready()

		this.nodes = [
			this.genesis,
			this.wallet1,
			this.wallet2,
			this.hub,
		]

		const { unit, error } = await this.genesis.sendBytes({ toAddress: await this.wallet1.getAddress(), amount: 10000000 })
		expect(unit).to.be.string
		expect(error).to.be.null
		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('network timetravel without params', async () => {
		const { error } = await this.network.timetravel()
		expect(error).to.be.null

		await this.expectTimeInNodes(Date.now())
	}).timeout(30000)

	it('network timetravel to', async () => {
		const date = '2030-01-01 07:00'
		const { error } = await this.network.timetravel({ to: date })
		expect(error).to.be.null

		await this.expectTimeInNodes(new Date(date).getTime())
	}).timeout(30000)

	it('network timetravel shift milliseconds', async () => {
		const { time: timeBefore } = await this.genesis.getTime()

		const { error } = await this.network.timetravel({ shift: 1000 })
		expect(error).to.be.null

		await this.expectTimeInNodes(timeBefore + 1000)
	}).timeout(30000)

	it('network timetravel shift seconds', async () => {
		const { time: timeBefore } = await this.genesis.getTime()

		const { error } = await this.network.timetravel({ shift: '30s' })
		expect(error).to.be.null

		await this.expectTimeInNodes(timeBefore + 1000 * 30)
	}).timeout(30000)

	it('network timetravel shift minutes', async () => {
		const { time: timeBefore } = await this.genesis.getTime()

		const { error } = await this.network.timetravel({ shift: '10m' })
		expect(error).to.be.null

		await this.expectTimeInNodes(timeBefore + 1000 * 60 * 10)
	}).timeout(30000)

	it('network timetravel shift hours', async () => {
		const { time: timeBefore } = await this.genesis.getTime()

		const { error } = await this.network.timetravel({ shift: '8h' })
		expect(error).to.be.null

		await this.expectTimeInNodes(timeBefore + 1000 * 60 * 60 * 8)
	}).timeout(30000)

	it('network timetravel shift days', async () => {
		const { time: timeBefore } = await this.genesis.getTime()

		const { error } = await this.network.timetravel({ shift: '3d' })
		expect(error).to.be.null

		await this.expectTimeInNodes(timeBefore + 1000 * 60 * 60 * 24 * 3)
	}).timeout(30000)

	it('network timetravel shift in past', async () => {
		const { time: timeBefore } = await this.genesis.getTime()

		const { error } = await this.network.timetravel({ shift: -10000 })
		expect(error).to.include('Attempt to timetravel in past')

		await this.expectTimeInNodes(timeBefore)
	}).timeout(30000)

	it('network timetravel shift incorrect format', async () => {
		const { time: timeBefore } = await this.genesis.getTime()

		const { error } = await this.network.timetravel({ shift: '10f' })
		expect(error).to.include("Unsupported 'shift' format '10f'")

		await this.expectTimeInNodes(timeBefore)
	}).timeout(30000)

	it('network timetravel both "shift" and "to" params are present', async () => {
		const date = '2040-01-01 7:00'
		const { error } = await this.network.timetravel({ to: date, shift: '10d' })
		expect(error).to.be.null

		await this.expectTimeInNodes(new Date(date).getTime())
	}).timeout(30000)

	it('network timetravel to past', async () => {
		const { time: timeBefore } = await this.genesis.getTime()
		const { error } = await this.network.timetravel({ to: '2007-01-01 07:00' })
		expect(error).to.include('Attempt to timetravel in past')

		await this.expectTimeInNodes(timeBefore)
	}).timeout(30000)

	it('network timefreeze', async () => {
		await this.network.timefreeze()
		const { time: timeBefore } = await this.genesis.getTime()

		await Utils.sleep(3000)

		await this.expectTimeInNodes(timeBefore)
	}).timeout(30000)

	it('network timerun', async () => {
		await this.network.timerun()
		const { time: timeBefore } = await this.genesis.getTime()

		await Utils.sleep(3000)

		await this.expectTimeInNodes(timeBefore + 3000)
	}).timeout(30000)

	it('network timefreeze and timetravel', async () => {
		await this.network.timefreeze()
		const { time: timeBefore } = await this.genesis.getTime()
		await this.network.timetravel({ shift: 864000 * 1000 })

		await Utils.sleep(3000)

		await this.expectTimeInNodes(timeBefore + 864000 * 1000)
	}).timeout(30000)

	it('network timerun after freeze and travel', async () => {
		await this.network.timerun()
		const { time: timeBefore } = await this.genesis.getTime()

		await Utils.sleep(3000)

		await this.expectTimeInNodes(timeBefore + 3000, 500)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
