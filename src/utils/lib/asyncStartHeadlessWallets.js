const asyncStartHeadlessWallets = (network, n) => {
	return Promise.all(Array(n).fill().map(() => network.newHeadlessWallet().ready()))
}

const asyncStartHeadlessWalletsWithMnemonics = (network, mnemonics) => {
	return Promise.all(mnemonics.map(m => network.newHeadlessWallet({ mnemonic: m }).ready()))
}

module.exports = {
	asyncStartHeadlessWallets,
	asyncStartHeadlessWalletsWithMnemonics,
}
