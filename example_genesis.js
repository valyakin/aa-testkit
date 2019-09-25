(async () => {
	require('./require')
	const Network = requireRoot('src/network')

	const network = await Network.genesis({ silent: false })
	const genesis = network.genesisNode
	const hub = await network.newObyteHub({ silent: true }).ready()
	const wallet = await network.newHeadlessWallet({ silent: true }).ready()
	const wallet2 = await network.newHeadlessWallet({ silent: true }).ready()

	genesis.loginToHub()

	const address = await wallet.getAddress()
	const address2 = await wallet2.getAddress()

	console.log('address', address)
	await sleep(3000)
	genesis.sendBytes({ toAddress: address, amount: 100000 })
	await sleep(3000)
	genesis.postWitness()
	await sleep(3000)
	wallet.sendBytes({ toAddress: address2, amount: 50000 })
	await sleep(3000)
	genesis.postWitness()
	await sleep(3000)
	genesis.postWitness()
	await sleep(3000)
	genesis.postWitness()
})()

function sleep (ms) {
	console.log('sleep')
	return new Promise(resolve => {
		setTimeout(() => resolve(), ms)
	})
}
