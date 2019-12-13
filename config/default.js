const path = require('path')

module.exports = {
	'aa-testkit': {
		TESTDATA_DIR: path.join(__dirname, '../testdata'),
		WALLETS_ARE_SINGLE_ADDRESS: true,
		DEFAULT_PASSPHRASE: '0000',
		NETWORK_PORT: 6611,
	},
}
