require('./require')
const config = require('config')
const fs = require('fs')
const {
	ObyteHub,
	ObyteWitness,
	ObyteExplorer,
	HeadlessWallet,
} = requireRoot('src/nodes')

const isSilent = true

fs.mkdirSync(config.TEST_RUN_HOME, { recursive: true })

const hub = new ObyteHub({ silent: isSilent, id: 'obyte-hub-001' })
const witness = new ObyteWitness({ silent: isSilent, id: 'obyte-witness-001' })
const explorer = new ObyteExplorer({ silent: isSilent, id: 'obyte-explorer-001' })
const alice = new HeadlessWallet({ silent: isSilent, id: 'headless-wallet-001' })
const bob = new HeadlessWallet({ silent: isSilent, id: 'headless-wallet-002' })

alice.once('started', async () => {
	console.log('Up and running', alice.id)

	const aliceAddress = await alice.getAddress()
	const bobAddress = await bob.getAddress()

	console.log("Alice's address", aliceAddress)
	console.log("Bob's address", bobAddress)
	try {
		const unit = await alice.sendBytes({ address: bobAddress, amount: 100000 })
		console.log('Sent bytes to Bob in unit', unit)
	} catch (error) {
		console.log('Error sending bytes:', error)
	}
})
