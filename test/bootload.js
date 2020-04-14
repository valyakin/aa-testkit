/* eslint-disable chai-friendly/no-unused-expressions */
// avoid importing `expect` in every test
const chai = require('chai')
const expect = chai.expect
global.expect = expect

const { Utils } = require('../main')

chai.use((_chai, utils) => {
	chai.Assertion.addProperty('validAddress', function () {
		const address = utils.flag(this, 'object')
		const negate = utils.flag(this, 'negate')
		const check = Utils.isValidAddress(address)
		new chai.Assertion(check).to.be.equal(!negate)
	})

	chai.Assertion.addProperty('validUnit', function () {
		const unit = utils.flag(this, 'object')
		const negate = utils.flag(this, 'negate')
		const check = Utils.isValidBase64(unit, 44) && unit.endsWith('=')
		new chai.Assertion(check).to.be.equal(!negate)
	})
})
