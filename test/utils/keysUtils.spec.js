const Mnemonic = require('bitcore-mnemonic')
const { Testkit } = require('../../main')
const { Utils } = Testkit()

describe('Check `keys` methods of utils', function () {
	this.timeout(60000)

	it('Generate some mnemonics and check if they are valid', async () => {
		const mnemonic = Utils.generateMnemonic()
		expect(Mnemonic.isValid(mnemonic)).to.be.true
	}).timeout(30000)

	it('Derive first pub key and verify', async () => {
		const pubkey = Utils.getFirstPubkey('assume anchor idle muscle hub junior sniff shy anxiety fantasy scan hill')
		expect(pubkey).to.be.equal('QMWQRJV6NCYGUI6X7BWRKLLBQVQYLZ27')
	}).timeout(30000)
})
