const isValidAddress = require('ocore/validation_utils').isValidAddress

describe('Check agent deployment feature', function () {
	this.timeout(60000)

	it('deploy agent from path with plaintext', async () => {
		const address = 'PVMCXUZBEHCFWOLXUDQVNCQZ476LNEW4'
		const notAddress = '123123'

		expect(isValidAddress(address)).to.be.true
		expect(isValidAddress(notAddress)).to.be.false

		expect(address).to.be.validAddress
		expect(notAddress).not.to.be.validAdd
	}).timeout(30000)
})
