const asyncStartHeadlessWallets = (network, n) => {
	return Promise.all(Array(n).fill().map(() => network.newHeadlessWallet().ready()))
}

module.exports = asyncStartHeadlessWallets
