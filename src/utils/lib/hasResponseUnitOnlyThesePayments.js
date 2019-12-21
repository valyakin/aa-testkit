function hasResponseUnitOnlyThesePayments (objUnit, arrExpectedOutputs) {
		const aa_address = objUnit.unit.authors[0].address
		
		// we sort expected payments by unit
		const assocExpectedOutputsByAsset = {}
		arrExpectedOutputs.forEach(expectedOutput => {
			if (!expectedOutput.asset || expectedOutput.asset === 'base')
				var asset = 'base'
			else
				var asset = expectedOutput.asset
			if (!assocExpectedOutputsByAsset[asset])
				assocExpectedOutputsByAsset[asset] = []
			assocExpectedOutputsByAsset[asset].push(expectedOutput)
		})
		// we filter payment messages
		const paymentMessages = objUnit.unit.messages.filter(m => m.app === 'payment')

		//we check that for each asset, expected outputs and actual outputs match
		for (var asset in assocExpectedOutputsByAsset){
			if (asset === 'base')
				var payloadForThisAsset = paymentMessages.find(m => m.asset === undefined)
			else
				var payloadForThisAsset = paymentMessages.find(m => m.asset === asset)
			if (!payloadForThisAsset)
				return false
			const outputsForThisAsset = payloadForThisAsset.payload.outputs.filter(o => o.address != aa_address) // we exclude change outputs
			const expectedOutputsForThisAsset = assocExpectedOutputsByAsset[asset]

			if (outputsForThisAsset.length != expectedOutputsForThisAsset.length)
				return false

			for (var i=0; i < outputsForThisAsset.length; i++){
				expectedOutputsForThisAsset.forEach((expectedOutput, index) => {
					if (expectedOutput.address === outputsForThisAsset[i].address && expectedOutput.amount === outputsForThisAsset[i].amount)
						return expectedOutputsForThisAsset.splice(index, 1)
				})
			}
			if (expectedOutputsForThisAsset.length > 0) // if expected output is missing
				return false
		}
			return true
}

module.exports = hasResponseUnitOnlyThesePayments