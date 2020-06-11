const Mnemonic = require('bitcore-mnemonic')
const objectHash = require('ocore/object_hash')

function generateMnemonic () {
	let mnemonic = new Mnemonic()
	while (!Mnemonic.isValid(mnemonic.toString())) {
		mnemonic = new Mnemonic()
	}
	return mnemonic.phrase
}

function getPubkey (mnemonicPhrase, passphrase, account, isChange, addressIndex) {
	const mnemonic = new Mnemonic(mnemonicPhrase)
	const xPrivKey = mnemonic.toHDPrivateKey(passphrase)
	const path = "m/44'/0'/" + account + "'/" + isChange + '/' + addressIndex
	const pubkey = xPrivKey.derive(path).publicKey.toBuffer().toString('base64')

	return objectHash.getChash160(['sig', { pubkey: pubkey }])
}

function getFirstAddress (mnemonicPhrase, passphrase = '0000') {
	return getPubkey(mnemonicPhrase, passphrase, 0, 0, 0)
}

module.exports = {
	getPubkey,
	getFirstAddress,
	generateMnemonic,
}
