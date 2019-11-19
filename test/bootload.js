/* eslint-disable chai-friendly/no-unused-expressions */
// avoid importing `expect` in every test
const chai = require('chai')
const expect = chai.expect
global.expect = expect

const { Utils } = require('../main')

chai.Assertion.addChainableMethod('validAddress', (address) => {
	new chai.Assertion(Utils.isValidAddress(address)).to.be.true
})

chai.Assertion.addChainableMethod('validUnit', (unit) => {
	new chai.Assertion(Utils.isValidBase64(unit)).to.be.true
})
