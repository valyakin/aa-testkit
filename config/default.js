const path = require('path')

module.exports = {
	'aa-testkit': {
		TESTDATA_DIR: path.join(__dirname, '../testdata'),
		WALLETS_ARE_SINGLE_ADDRESS: true,
		NETWORK_PORT: 6611,
	},
}
