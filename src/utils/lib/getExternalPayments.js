const getExternalPayments = (objUnit, arrExpectedOutputs) => {
	const aaAddress = objUnit.authors[0].address
	const paymentMessages = objUnit.messages.filter(m => m.app === 'payment')

	const payments = paymentMessages.map(m => m.payload).reduce((acc, cur) => {
		const asset = cur.asset || 'base'
		return [
			...acc, ...cur.outputs.map(out => ({
				...(asset === 'base' ? {} : { asset }),
				address: out.address,
				amount: out.amount,
			})).filter(out => out.address !== aaAddress),
		]
	}, [])

	return payments
}

module.exports = getExternalPayments
