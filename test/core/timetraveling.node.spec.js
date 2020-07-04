const { Testkit } = require('../../main')
const { Network, Utils } = Testkit()

describe('Check timetravel node feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create().run()
	})

	it('Create network', async () => {
		this.genesis = await this.network.getGenesisNode().ready()
		this.wallet = await this.network.newHeadlessWallet().ready()

		const walletAddress = await this.wallet.getAddress()

		const { unit, error } = await this.genesis.sendBytes({ toAddress: walletAddress, amount: 100000 })
		expect(unit).to.be.string
		expect(error).to.be.null
		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('node timetravel without params', async () => {
		const { error } = await this.wallet.timetravel()
		expect(error).to.be.null

		const { time } = await this.wallet.getTime()
		expect(time).to.be.finite.and.approximately(Date.now(), 500)
	}).timeout(30000)

	it('node timetravel to', async () => {
		const date = '2030-01-01 07:00'
		const { error } = await this.wallet.timetravel({ to: date })
		expect(error).to.be.null

		const { time } = await this.wallet.getTime()

		expect(time).to.be.finite.and.approximately(new Date(date).getTime(), 500)
	}).timeout(30000)

	it('node timetravel shift milliseconds', async () => {
		const { time: timeBefore } = await this.wallet.getTime()

		const { error } = await this.wallet.timetravel({ shift: 1000 })
		expect(error).to.be.null

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore + 1000, 500)
	}).timeout(30000)

	it('node timetravel shift seconds', async () => {
		const { time: timeBefore } = await this.wallet.getTime()

		const { error } = await this.wallet.timetravel({ shift: '30s' })
		expect(error).to.be.null

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore + 1000 * 30, 500)
	}).timeout(30000)

	it('node timetravel shift minutes', async () => {
		const { time: timeBefore } = await this.wallet.getTime()

		const { error } = await this.wallet.timetravel({ shift: '10m' })
		expect(error).to.be.null

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore + 1000 * 60 * 10, 500)
	}).timeout(30000)

	it('node timetravel shift hours', async () => {
		const { time: timeBefore } = await this.wallet.getTime()

		const { error } = await this.wallet.timetravel({ shift: '8h' })
		expect(error).to.be.null

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore + 1000 * 60 * 60 * 8, 500)
	}).timeout(30000)

	it('node timetravel shift days', async () => {
		const { time: timeBefore } = await this.wallet.getTime()

		const { error } = await this.wallet.timetravel({ shift: '3d' })
		expect(error).to.be.null

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore + 1000 * 60 * 60 * 24 * 3, 500)
	}).timeout(30000)

	it('node timetravel shift in past', async () => {
		const { time: timeBefore } = await this.wallet.getTime()

		const { error } = await this.wallet.timetravel({ shift: -10000 })
		expect(error).to.be.string('Attempt to timetravel in past')

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore, 500)
	}).timeout(30000)

	it('node timetravel shift incorrect format', async () => {
		const { time: timeBefore } = await this.wallet.getTime()

		const { error } = await this.wallet.timetravel({ shift: '10f' })
		expect(error).to.be.string("Unsupported 'shift' format '10f'")

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore, 500)
	}).timeout(30000)

	it('network timetravel both "shift" and "to" params are present', async () => {
		const date = '2040-01-01 7:00'
		const { error } = await this.wallet.timetravel({ to: date, shift: '10d' })
		expect(error).to.be.null

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(new Date(date).getTime(), 500)
	}).timeout(30000)

	it('node timetravel to past', async () => {
		const { time: timeBefore } = await this.wallet.getTime()
		const { error } = await this.wallet.timetravel({ to: '2007-01-01 07:00' })
		expect(error).to.be.string('Attempt to timetravel in past')

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore, 500)
	}).timeout(30000)

	it('node timefreeze', async () => {
		await this.wallet.timefreeze()
		const { time: timeBefore } = await this.wallet.getTime()

		await Utils.sleep(3000)

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.equal(timeBefore)
	}).timeout(30000)

	it('node timerun', async () => {
		await this.wallet.timerun()
		const { time: timeBefore } = await this.wallet.getTime()

		await Utils.sleep(3000)

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore + 3000, 500)
	}).timeout(30000)

	it('node timefreeze and timetravel', async () => {
		await this.wallet.timefreeze()
		const { time: timeBefore } = await this.wallet.getTime()
		const { error } = await this.wallet.timetravel({ shift: 86400 * 1000 })
		expect(error).to.be.null

		await Utils.sleep(3000)

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.equal(timeBefore + 86400 * 1000)
	}).timeout(30000)

	it('node timerun after freeze and travel', async () => {
		await this.wallet.timerun()
		const { time: timeBefore } = await this.wallet.getTime()

		await Utils.sleep(3000)

		const { time: timeAfter } = await this.wallet.getTime()
		expect(timeAfter).to.be.finite.and.approximately(timeBefore + 3000, 500)
	}).timeout(30000)

	it('timefreeze error when time already frozen', async () => {
		const { error: error1 } = await this.wallet.timefreeze()
		expect(error1).to.be.null

		const { error: error2 } = await this.wallet.timefreeze()
		expect(error2).to.be.equal('Time has been frozen already')
	}).timeout(30000)

	it('timerun error when time already running', async () => {
		const { error: error1 } = await this.wallet.timerun()
		expect(error1).to.be.null

		const { error: error2 } = await this.wallet.timerun()
		expect(error2).to.be.equal('Time is running already')
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
