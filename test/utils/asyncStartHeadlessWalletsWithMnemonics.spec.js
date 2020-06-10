const { Testkit } = require('../../main')
const { Network, Utils } = Testkit()

describe('Check `asyncStartHeadlessWalletsWithMnemonics` Utils method', function () {
	this.timeout(60000)

	before(async () => {
		this.network = await Network.create()
			.run()
	})

	it('Start 10 wallets with known mnemonics and verify addresses', async () => {
		const mnemonics = ['nurse slab ostrich wrestle daughter unusual bench cake use similar rabbit cave',
			'fine empty delay thumb switch keep spring remove degree hotel join process',
			'pepper cancel style offer burst deer clinic cause rhythm mix balcony situate',
			'luggage giraffe rebel diary spread assault bicycle almost client orbit side uncover',
			'amazing diamond leave spare draft wash social awkward behave erode improve brave',
			'explain rain gun east huge furnace panel wonder song add segment craft',
			'meat total crash marble loud warrior surprise weekend canyon text hover neck',
			'drop seven day supreme train utility achieve aerobic member rifle soup match',
			'friend talk letter crunch meat ranch neutral hurt zone donate destroy love',
			'toss sugar peasant solar diesel kid gossip plastic insect asthma dumb gasp']
		const pubkeys = ['WDTXAGDQQ23QHKR6N5NVBWWM6X3GPPB6',
			'6EFUD3Z53IL77VFTC5H676PQ6YOYGH5B',
			'M3CJXJAGFSHW2MH5Z6LMV3CL2YHE6C7Z',
			'BUDLMYFSOQ4ZHKV5YCHROJK73XHVRRIB',
			'ASQB5XUQU2PYPDQGWOTRTBK3EXJ2VWWJ',
			'P2LKM3JN6YN4WAMTYMA2ZOG4Y3RKS7HF',
			'BI4BS23II4VGRDF4FL3LYJAUWAPBGIQC',
			'235IFCYZVYZQKCG45UYTZJAMQ5S7DTMW',
			'2RX6MMEKVCH3EEAYQKDO37VWLFF6BHO7',
			'ZRYJC2WGPV4FSDHKDES7AIIU3X2ICUUM']

		const wallets = await Utils.asyncStartHeadlessWalletsWithMnemonics(this.network, mnemonics)

		const addresses = await Promise.all(wallets.map(w => w.getAddress()))
		expect(addresses).to.be.deep.equal(pubkeys)
	}).timeout(30000)

	after(async () => {
		await this.network.stop()
	})
})
