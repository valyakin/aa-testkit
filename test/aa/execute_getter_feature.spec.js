const path = require('path')
const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Test executeGetter feature', function () {
	this.timeout(120 * 1000)

	before(async () => {
		this.network = await Network.create()
			.with.agent({ aa: path.join(__dirname, './agents/lib/execute_getter.aa') })
			.with.wallet({ alice: 1e9 })
			.run()
	})

	it('Test sum getter', async () => {
		const { result, error } = await this.network.wallet.alice.executeGetter({
			aaAddress: this.network.agent.aa,
			getter: 'sum',
			args: [5, 10],
		})

		expect(error).to.be.null
		expect(result).to.be.equal(15)
	}).timeout(15000)

	it('Test string_concat getter', async () => {
		const { result, error } = await this.network.wallet.alice.executeGetter({
			aaAddress: this.network.agent.aa,
			getter: 'string_concat',
			args: ['foo', 'bar'],
		})

		expect(error).to.be.null
		expect(result).to.be.equal('foobar')
	}).timeout(15000)

	it('Test no such getter', async () => {
		const { error } = await this.network.wallet.alice.executeGetter({
			aaAddress: this.network.agent.aa,
			getter: 'not_a_getter',
			args: [],
		})

		expect(error).to.be.equal('no such getter: not_a_getter')
	}).timeout(15000)

	it('Test array argument', async () => {
		const { result, error } = await this.network.wallet.alice.executeGetter({
			aaAddress: this.network.agent.aa,
			getter: 'array_test',
			args: [1, [2, 3, 4, 5, 6]],
		})

		expect(error).to.be.null
		expect(result).to.be.equal(21)
	}).timeout(15000)

	it('Test obj argument', async () => {
		const { result, error } = await this.network.wallet.alice.executeGetter({
			aaAddress: this.network.agent.aa,
			getter: 'obj_test',
			args: [{ a: 'foo', b: 'bar', c: 'buzz' }],
		})

		expect(error).to.be.null
		expect(result).to.be.equal('foobarbuzz')
	}).timeout(15000)

	after(async () => {
		await this.network.stop()
	})
})
