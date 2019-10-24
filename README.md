# aa-testkit

Instant Obyte devnet network set up and testing

## Requirements
* Node.js >= 10.16.0
* yarn >= 1.17.3

## Project setup
```bash
yarn
```

## Run tests
```bash
# Run all tests
yarn test:all

# Run Autonomous Agents specific tests
yarn test:aa

# Run specific test
yarn test test/aa/just_a_bouncer.spec.js
```

Obyte nodes data is stored in `testdata/run-${runId}` folder

Any node internal logs can be found in `testdata/runid-{runId}/{nodeId}/.config/{nodeType}/log.txt`, for example `testdata/runid-0091/obyte-hub-0001/.config/testkit-obyte-hub/log.txt` for ObyteHub node

A node can be started with `{ silent: false }` argument which will disable suppression of the node's console output.
This will let you to get initial output from `ocore` library or from node child process `console.log` statements

```javascript
const wallet = await network.newHeadlessWallet({ silent: false }).ready()
```

## Examples

Every node runs inside its own child process. Main process sends commands to nodes and receives messages from them via Node.js IPC.

### Set up network from genesis

```javascript
require('./require')
// this will run hub node and genesis node
// genesis node combines wallet and witness
const Networks = require('src/networks')
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

### Time Travel API

`aa-testkit` allows you to set the current network time in the future. This can be helpful for testing time-dependent AA.
> **Note:** Timetravel should be used only after every node has been started. Running a node after timetravel can lead to network inconsistency.

```javascript
// `timetravelTo` argument can be either a timestamp or a string in the valid format of `Date()` function
await network.timetravelTo('2050-01-01')

```

## Tests

`aa-testkit` uses [mocha](https://mochajs.org) and [chai](https://www.chaijs.com/) for running tests.

To create new test add a `new_test.spec.js` file inside `test/` directory

```javascript
const Network = requireRoot('src/networks')
const isValidAddress = require('ocore/validation_utils').isValidAddress

describe('Testsuit brief description', function () {
	// set global timeout for testsuit
	this.timeout(60000)
	// stop execution of subsequent tests after first error
	this.bail(true)

	before(async () => {
		// create network and start genesis
		this.network = await Network.genesis()
	})

	it('Test 1', async () => {
		const network = this.network
		const genesis = await network.getGenesisNode().ready()
		const address = await genesis.getAddress()

		// Use statement assertions provided by `chai`
		// Test execution will be interrupted if `expect` statement does not pass
		expect(isValidAddress(address)).to.be.true

		this.address = address
	})
	// set timeout of this specific test
		.timeout(30000)

	it('Test 2', async () => {
		// tests are order dependent
		const network = this.network
		// .any context from previous tests can be passed through `this`
		const address = this.address
		expect(isValidAddress(address)).to.be.true
	}).timeout(30000)

	after(async () => {
		// clean up. stop network and kill all child processes.
		await this.network.stop()
	})
})

```

Finnaly, run it

```bash
yarn test test/new_test.spec.js
```

[Test example with AA deployment](./test/aa/just_a_bouncer.spec.js)

[Test example with timetravel](./test/aa/timetravel_check.spec.js)

[Test example with AA state vars checking](./test/aa/vars_setting_check.spec.js)
