const path = require('path')
const { Testkit } = require('../../main')
const { Network } = Testkit()

describe('Check agent deployment feature', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
		this.genesis = await this.network.getGenesisNode().ready()
		this.deployer = await this.network.newHeadlessWallet().ready()

		const address = await this.deployer.getAddress()
		const { unit, error } = await this.genesis.sendBytes({ toAddress: address, amount: 1e9 })

		expect(unit).to.be.string
		expect(error).to.be.null
		await this.network.witnessUntilStable(unit)
	})

	it('deploy agent no params', async () => {
		const { error } = await this.deployer.deployAgent()
		expect(error).to.be.string('null value in ["autonomous agent",null]')
	}).timeout(30000)

	it('deploy agent empty string', async () => {
		const { error } = await this.deployer.deployAgent('')
		expect(error).to.be.string('parserResult should be Array of length 1')
	}).timeout(30000)

	it('deploy agent wrong string', async () => {
		const { error } = await this.deployer.deployAgent('wrong agent string')
		expect(error).to.include('invalid syntax at line 1 col 1')
	}).timeout(30000)

	it('deploy agent empty object', async () => {
		const { error } = await this.deployer.deployAgent({})
		expect(error).to.include('empty object')
	}).timeout(30000)

	it('deploy agent empty array', async () => {
		const { error } = await this.deployer.deployAgent([])
		expect(error).to.include('empty array')
	}).timeout(30000)

	it('deploy agent from path with plaintext', async () => {
		const { address, unit, error } = await this.deployer.deployAgent(path.join(__dirname, './files/plaintext.agent'))
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('deploy agent from path with plaintext array', async () => {
		const { address, unit, error } = await this.deployer.deployAgent(path.join(__dirname, './files/plaintext.array.agent'))
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('deploy agent from string in javascript file', async () => {
		const { address, unit, error } = await this.deployer.deployAgent(path.join(__dirname, './files/agent.string.js'))
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('deploy agent from string in javascript file array', async () => {
		const { address, unit, error } = await this.deployer.deployAgent(path.join(__dirname, './files/agent.array.string.js'))
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('deploy agent from object in javascript file', async () => {
		const { address, unit, error } = await this.deployer.deployAgent(path.join(__dirname, './files/agent.object.js'))
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('deploy agent from object in javascript file array', async () => {
		const { address, unit, error } = await this.deployer.deployAgent(path.join(__dirname, './files/agent.array.object.js'))
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('deploy agent from ojson object', async () => {
		const ojson = {
			bounce_fees: { base: 300000 },
			messages: [
				{
					app: 'payment',
					payload: {
						asset: 'base',
						outputs: [
							{ address: '{trigger.address}', amount: '{trigger.output[[asset=base]] - 1000}' },
						],
					},
				},
			],
		}

		const { address, unit, error } = await this.deployer.deployAgent(ojson)
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	it('deploy agent from ojson array', async () => {
		const ojson = [
			'autonomous agent',
			{
				bounce_fees: { base: 400000 },
				messages: [
					{
						app: 'payment',
						payload: {
							asset: 'base',
							outputs: [
								{ address: '{trigger.address}', amount: '{trigger.output[[asset=base]] - 1000}' },
							],
						},
					},
				],
			},
		]

		const { address, unit, error } = await this.deployer.deployAgent(ojson)
		expect(error).to.be.null
		expect(address).to.be.validAddress
		expect(unit).to.be.validUnit

		await this.network.witnessUntilStable(unit)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
