/* eslint-disable chai-friendly/no-unused-expressions */
// avoid importing `expect` in every test
const chai = require('chai')
const expect = chai.expect
global.expect = expect

const isValidAddress = require('ocore/validation_utils').isValidAddress
const isValidBase64 = require('ocore/validation_utils').isValidBase64

chai.Assertion.addChainableMethod('validAddress', (address) => {
	new chai.Assertion(isValidAddress(address)).to.be.true
})

chai.Assertion.addChainableMethod('validUnit', (unit) => {
	new chai.Assertion(isValidBase64(unit)).to.be.true
})
