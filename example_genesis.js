(async () => {
	require('./require')
	const Network = requireRoot('src/network')

	const network = await Network.genesis({ silent: true })
	const genesis = network.genesisNode
	const hub = await network.newObyteHub({ silent: false }).ready()
	const wallet = await network.newHeadlessWallet({ silent: true }).ready()

	genesis.loginToHub()

	const address = await wallet.getAddress()

	genesis.sendBytes({ toAddress: address, amount: 100000 })
	// console.log('hub', JSON.stringify(hub, null, 2))
})()
