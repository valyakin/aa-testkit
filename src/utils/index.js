const sleep = require('./lib/sleep')
const isValidBase64 = require('./lib/isValidBase64')
const isValidAddress = require('./lib/isValidAddress')
const getIdForPrefix = require('./lib/getIdForPrefix')
const countCommissionInUnits = require('./lib/countCommissionInUnits')
const hasOnlyTheseExternalPayments = require('./lib/hasOnlyTheseExternalPayments')
const {
	getPubkey,
	generateMnemonic,
	getFirstAddress,
} = require('./lib/keys')
const { asyncStartHeadlessWallets, asyncStartHeadlessWalletsWithMnemonics } = require('./lib/asyncStartHeadlessWallets')

module.exports = {
	sleep,
	isValidBase64,
	isValidAddress,
	getIdForPrefix,
	countCommissionInUnits,
	asyncStartHeadlessWallets,
	hasOnlyTheseExternalPayments,
	asyncStartHeadlessWalletsWithMnemonics,

	getPubkey,
	generateMnemonic,
	getFirstAddress,
}
