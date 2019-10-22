# aa-testkit

Instant Obyte devnet network set up and testing

## Project setup
```
yarn
```

## Run tests
```
# Run all tests
yarn test

# Run Autonomous Agents specific tests
yarn test:aa
```

Obyte nodes data is stored in `testdata/run-${runId}` folder

## Examples

Every node runs inside its own child process. Main process sends commands to nodes and receives messages from them via Node.js IPC.

### Set up network from genesis

```javascript
// this will run hub node and genesis node
// genesis node combines wallet and witness
const Networks = require('./src/networks')
const network = await Networks.genesis()

const genesis = await network.getGenesisNode().ready()

// set up and run wallet node
const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()

// send some bytes from genesis node. Genesis node starts with a lot of bytes on its account
await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })

// make genesis node to post witness. Write witness(3) to post 3 witnesses
// `await` will ensure that every node in network received witness
await network.witness()

// get  balance. balance : { base: { stable: 0, pending: 1000000, is_private: null } }
const balance = await wallet.getBalance()

// run obyte dag explorer node
const explorer = await network.newObyteExplorer().ready()
```

### Autonomous Agents deployment

```javascript
// run agent deployer node and send some bytes to it so it can deploy agent in the network
const deployer = await network.newAgentDeployer().ready()
const deployerAddress = await deployer.getAddress()

await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
await network.witness()

// deploy AA. `agent` is AA in ojson. You can use `parse` from `ocore/formula/parse_ojson` to convert AA from plain text to ojson
const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(agent)
await network.witness(2)

// post `data` in network to trigger AA execution
const newUnit = await wallet.sendData({
	toAddress: agentAddress,
	amount: 10000,
	payload: {
		var: 'trigger_var',
	},
})

// read AA state vars
const { vars } = await deployer.readAAStateVars(agentAddress)
```
