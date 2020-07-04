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

	it('Check deep.equalInAnyOrder', async () => {
		expect([]).to.be.deep.equalInAnyOrder([])
		expect([1, 2, 3]).to.be.deep.equalInAnyOrder([1, 2, 3])
		expect([1, 2, 3]).to.be.deep.equalInAnyOrder([2, 3, 1])
		expect([3, 2, 1]).to.be.deep.equalInAnyOrder([1, 2, 3])
		expect([3, 1, 2]).to.be.deep.equalInAnyOrder([1, 2, 3])
		expect([1, 2, 3]).to.not.be.deep.equalInAnyOrder([2, 3, 3])
		expect([1, 2]).to.be.not.deep.equalInAnyOrder([1, 2, 3])
		expect([1, 2, 3]).to.be.not.deep.equalInAnyOrder([1, 2])
		expect([]).to.be.not.deep.equalInAnyOrder([1, 2])
		expect([1, 2, 3]).to.be.not.deep.equalInAnyOrder([])
		expect([1, 2, 3]).to.be.not.deep.equalInAnyOrder([1, 2, 3, 1])
		expect([1, 2, 3, 1]).to.be.not.deep.equalInAnyOrder([1, 2, 3])

		const obj1 = {
			a1: 1,
			b1: [1, 2, 3],
			c1: {
				x: 'foo',
				y: 'bar',
			},
		}

		const obj2 = {
			a2: 12,
			b2: 'foo1',
		}

		const obj3 = {
			a3: 123,
			b3: 'foo3',
		}

		expect([obj1, obj2, obj3]).to.be.deep.equalInAnyOrder([obj1, obj2, obj3])
		expect([obj1, obj2, obj3]).to.be.deep.equalInAnyOrder([obj2, obj3, obj1])
		expect([obj3, obj2, obj1]).to.be.deep.equalInAnyOrder([obj1, obj2, obj3])
		expect([obj3, obj1, obj2]).to.be.deep.equalInAnyOrder([obj1, obj2, obj3])
		expect([obj1, obj2, obj3]).to.not.be.deep.equalInAnyOrder([obj2, obj3, obj3])
		expect([obj1, obj2]).to.be.not.deep.equalInAnyOrder([obj1, obj2, obj3])
		expect([obj1, obj2, obj3]).to.be.not.deep.equalInAnyOrder([obj1, obj2])
		expect([]).to.be.not.deep.equalInAnyOrder([obj1, obj2])
		expect([obj1, obj2, obj3]).to.be.not.deep.equalInAnyOrder([])

		expect([{ a: [1, 2, 3] }]).to.be.deep.equalInAnyOrder([{ a: [3, 2, 1] }])
	}).timeout(30000)
})
