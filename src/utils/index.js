const sleep = require('./lib/sleep')
const isValidBase64 = require('./lib/isValidBase64')
const isValidAddress = require('./lib/isValidAddress')
const getIdForPrefix = require('./lib/getIdForPrefix')
const getExternalPayments = require('./lib/getExternalPayments')
const countCommissionInUnits = require('./lib/countCommissionInUnits')
const hasOnlyTheseExternalPayments = require('./lib/hasOnlyTheseExternalPayments')
const {
	getPubkey,
	generateMnemonic,
	getFirstAddress,
	isValidMnemonic,
} = require('./lib/keys')
const { asyncStartHeadlessWallets, asyncStartHeadlessWalletsWithMnemonics } = require('./lib/asyncStartHeadlessWallets')

module.exports = {
	sleep,
	isValidBase64,
	isValidAddress,
	getIdForPrefix,
	getExternalPayments,
	countCommissionInUnits,
	asyncStartHeadlessWallets,
	hasOnlyTheseExternalPayments,
	asyncStartHeadlessWalletsWithMnemonics,

	getPubkey,
	generateMnemonic,
	getFirstAddress,
	isValidMnemonic,
}
