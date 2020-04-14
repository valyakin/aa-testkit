describe('Check chai additional assertions', function () {
	this.timeout(60000)
	it('Check validUnit', async () => {
		expect('kk').to.not.be.validUnit
		expect(123).to.not.be.validUnit
		expect({}).to.not.be.validUnit
		expect([]).to.not.be.validUnit
		expect(() => {}).to.not.be.validUnit
		expect('12345678901234567890123456789012345678901234').to.not.be.validUnit
		expect('pmWkWSBCL51Bfkhn79xPuKBKHz//H6B+mY6G9/eieu=').to.not.be.validUnit
		expect('pmWkWSBCL51Bfkhn79xPuKBKHz//H6B+mY6G9/eieuMM=').to.not.be.validUnit
		expect('pmWkWSBCL51Bfkhn79xPuKBKHz//H6B+mY6G9/eieuM=').to.be.validUnit
	}).timeout(30000)

	it('Check validAddress', async () => {
		expect('123').to.not.be.validAddress
		expect(123).to.not.be.validAddress
		expect({}).to.not.be.validAddress
		expect([]).to.not.be.validAddress
		expect(() => {}).to.not.be.validAddress
		expect('12345678901234567890123456789012').to.not.be.validAddress
		expect('EGPUJ2WKQMMOD75BMX5YJNYM2BWA22B').to.not.be.validAddress
		expect('EGPUJ2WKQMMOD75BMX5YJNYM2BWA22B55').to.not.be.validAddress
		expect('EGPUJ2WKQMMOD75BMX5YJNYM2BWA22B5').to.be.validAddress
	}).timeout(30000)
})
