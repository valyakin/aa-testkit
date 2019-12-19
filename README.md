# aa-testkit

Instant Obyte devnet network set up and testing

## Table of contents
* [Usage](#Usage)
* [Testkit API](#Testkit-API)
* [Network API](#Network-API)
* [Nodes API](#Nodes-API)
  * [Common node methods](#Common-node-methods)
  * [GenesisNode](#GenesisNode)
    * [Constructor](#GenesisNode-constructor-params)
    * [Methods](#GenesisNode-methods)
  * [ObyteHub](#ObyteHub)
    * [Constructor](#ObyteHub-constructor-params)
    * [Methods](#ObyteHub-methods)
  * [HeadlessWallet](#HeadlessWallet)
    * [Constructor](#HeadlessWallet-constructor-params)
    * [Methods](#HeadlessWallet-methods)
  * [ObyteExplorer](#ObyteExplorer)
    * [Constructor](#ObyteExplorer-constructor-params)
    * [Methods](#ObyteExplorer-methods)
* [Utils](#Utils)
* [Test Examples](#Test-Examples)
* [Writing Tests With Mocha](#Writing-Tests-With-Mocha)

## Usage
```javascript
// import test framework
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

// spin up new devnet
const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

// create new wallet and send some bytes from rich genesis node
const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()
const { unit } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
// and wait for witnessing
await network.witnessUntilStable(unit)

// get wallet balance
const walletBalance = await wallet.getBalance()
```

> **Note:** Node internal logs with usefull information can be found in `testdata/runid-{runId}/{nodeId}/.config/{nodeType}/log.txt`

## Testkit API

Defines how to import and configure `aa-testkit` module

#### __`Testkit(config)`__ *`: { Network, Nodes }`*

Testkit constructor function. Helps to configure network defaults

#### Parameters

*`config`* - network defaults configuration object

| Property                   |   Type  | Required |               Default              | Description                                                   |
|----------------------------|:-------:|:--------:|:----------------------------------:|---------------------------------------------------------------|
| TESTDATA_DIR               |  String |   false  | `node_modules/aa-testkit/testdata` | Absolute path to `testdata` directory                         |
| DEFAULT_PASSPHRASE         |  String |   false  |               `0000`               | Wallet passphrase                                             |
| NETWORK_PORT               |  Number |   false  |                6611                | Defines port, the network will be run on                      |
| WALLETS_ARE_SINGLE_ADDRESS | Boolean |   false  |                true                | Defines if HeadlessWallet nodes are single address by default |

<br>
<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const path = require('path')

const { Network } = Testkit({
  // should be absolute path
  TESTDATA_DIR: path.join(__dirname, '../testdata'),
  DEFAULT_PASSPHRASE: 'secret',
  NETWORK_PORT: 5000,
})

```
</details>

Alternatively, if you are using [node-config](https://www.npmjs.com/package/config) you can configure `Testkit` as `aa-testkit` submodule

<details>
<summary>Configuration with node-config</summary>

```javascript
// config/default.js
const path = require('path')

module.exports = {
  'aa-testkit': {
    TESTDATA_DIR: path.join(__dirname, '../testdata'),
    DEFAULT_PASSPHRASE: '0000',
    NETWORK_PORT: 6611,
  },
}

// then you can import `aa-testkit` and `config` variables will be used
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()
```
</details>

## Network API

Primary way to operate with network. Contains common functions for network management

#### __`Network.create(genesisParams, hubParams)`__ *`: <network>`*

Creates new devnet network from the scratch. Starts `GenesisNode` and `ObyteHub` node, the required minimum for network to operate. `GenesisNode` also provides functions of network witness. `GenesisNode` has a lot (`10e15`) of Bytes on its account.

#### Parameters

*`genesisParams`* - object passed to `GenesisNode` constructor to override default values. See [GenesisNode](#GenesisNode-constructor-params) Nodes API section.

*`hubParams`* - object passed to `ObyteHub` constructor to override default values. See [ObyteHub](#ObyteHub-constructor-params) Nodes API section.

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
```
</details>

---------------------------------------

#### __`network.getGenesisNode()`__ *`: <GenesisNode>`*

__Returns__ `GenesisNode` of this network

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
// calling `.ready()` assures that node have started at this point
const genesis = await network.getGenesisNode().ready()
```
</details>

---------------------------------------

#### __`network.getHub()`__ *`: <ObyteHub>`*

__Returns__ `ObyteHub` of this network

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
// calling `.ready()` assures that node have started at this point
const hub = await network.getHub().ready()
```
</details>

---------------------------------------

#### __`network.newHeadlessWallet(params)`__ *`: <HeadlessWallet>`*

Creates and starts new `HeadlessWallet` node in network.

#### Parameters

*`params`* - object passed to `HeadlessWallet` constructor to override default values. See [HeadlessWallet](#HeadlessWallet-constructor-params) Nodes API section.

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()
const wallet = await network.newHeadlessWallet().ready()
```
</details>

---------------------------------------

#### __`network.newObyteExplorer(params)`__ *`: <ObyteExplorer>`*

Creates and starts new `ObyteExplorer` node in network.

#### Parameters

*`params`* - object passed to `ObyteExplorer` constructor to override default values. See [ObyteExplorer](#ObyteExplorer-constructor-params) Nodes API section.

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

const explorer = await network.newObyteExplorer().ready()
```
</details>

---------------------------------------

#### __`network.sync()`__ *`: Promise<>`*

Wait for MCI on every node to be synchronized. Returns `Promise` that will be resolved when MCI on every node become identical.

---------------------------------------

#### __`network.witnessUntilStable(unit)`__ *`: Promise<>`*

Post witnesse until `unit` will stabilize. `Promise` will be resolved when `unit` become stable.

#### Parameters

*`unit: String`* - wait for stabilization of this unit

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

// create wallet and send bytes to it
const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()
const { unit } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
// witness last transaction
await network.witnessUntilStable(unit)
```
</details>

---------------------------------------

#### __`network.getAaResponseToUnit(unit)`__ *`: Promise<{ response }>`*

Retrieve autonomous agent execution response from `unit`. Method will make network to post witnesses until response is being received.

__Returns__ *Promise* that resolves to `{ response }` where `response` is the object of agent response

#### Parameters

*`unit : String`* - unit of aa execution to retrieve response from

<details>
<summary>Example</summary>

See [Agent AA response test example](#Test-Examples)
</details>

<details>
<summary>Response Object example</summary>

```javascript
{
  mci: 13,
  trigger_address: 'VL53Z3AQWQ7AX4QKFBA42B3YPY3UYIGK',
  trigger_initial_address: 'VL53Z3AQWQ7AX4QKFBA42B3YPY3UYIGK',
  trigger_unit: 'N9PI6hN+vmVMkmXMh58pFZErGt638Fwr6yhLQw3g3HA=',
  aa_address: 'WWHEN5NDHBI2UF4CLJ7LQ7VAW2QELMD7',
  bounced: false,
  response_unit: 'm2vasHgREngt/7f0y4g2d42A8Ih+A9iu5dBWGU5pnWg=',
  objResponseUnit: {
    version: '2.0dev',
    alt: '3',
    timestamp: 1574171283,
    messages: [[Object], [Object]],
    authors: [[Object]],
    last_ball_unit: 'myDMlLHavXhVF+IMkXS6ir/GkXFASXplaNzDCpsV/kA=',
    last_ball: 'jfh9QBcZVXsWE+Q5pstRQO1STO7gfngx9pLIVAxhsUM=',
    witness_list_unit: 'rC7dZW1x3OCw8Bh+6urKN5OB0rnsmNeNy6Exz3n+rZI=',
    parent_units: ['N9PI6hN+vmVMkmXMh58pFZErGt638Fwr6yhLQw3g3HA='],
    headers_commission: 267,
    payload_commission: 259,
    unit: 'm2vasHgREngt/7f0y4g2d42A8Ih+A9iu5dBWGU5pnWg=',
  },
  response: {
    responseVars:
      { team_asset: 'm2vasHgREngt/7f0y4g2d42A8Ih+A9iu5dBWGU5pnWg=' },
  },
  updatedStateVars: {
    WWHEN5NDHBI2UF4CLJ7LQ7VAW2QELMD7: {
      team_VL53Z3AQWQ7AX4QKFBA42B3YPY3UYIGK_founder_tax: [Object],
      team_VL53Z3AQWQ7AX4QKFBA42B3YPY3UYIGK_asset: [Object],
    },
  },
}
```
</details>

---------------------------------------

#### __`network.timetravel({ to, shift })`__ *`: Promise<{ error: string }>`*

allows you to set the current network time in the future. This can be helpful for testing time-dependent AA.
> **Note:** Timetravel should be used only after every node has been started. Running a node after timetravel can lead to network inconsistency.

__Returns__ *Promise* that resolves to `{ error }` after timetravel is done. `error` will be null if timetravel was successfull

#### Parameters

*`to`* - new time of the network. Can be either a timestamp or a string in the valid format of `Date()` function

*`shift`* - an offset for a current network time. You can pass a `Number` for a milliseconds or a `String` in format `%number%duration`

| %duration | Example | Result              |
|:---------:|:-------:|---------------------|
|    's'    |   '5s'  | shift in 5 seconds  |
|    'm'    |  '10m'  | shift in 10 minutes |
|    'h'    |  '24h'  | shift in 24 hours   |
|    'd'    |  '365d' | shift in 365 days   |

If both of `to` and `shift` are present, `to` will be used

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

const { error } = await network.timetravel({ to: '2050-01-01' })
```

Also check in [Test Examples](#Test-Examples)
</details>

---------------------------------------

#### __`network.stop()`__ *`: Promise<>`*

Send the command to every node to stop the process.

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()
const wallet = await network.newHeadlessWallet().ready()

// wait until every node exits
await network.stop()
```
</details>

---------------------------------------

## Nodes API

Section describes all aspects supported by nodes. This aspects includes constructor parameters, methods and events

> **Note:** Most of node constructor parameters are not required when using [Network API](#Network-API)

Any node can be created directly without using Network API. Although, it is not common but it allows you to create fully custom network

Every node runs inside its own child process. Main process sends commands to nodes and receives messages from them via Node.js IPC.

<details>
<summary>Creating nodes manually</summary>

```javascript
const { Testkit } = require('aa-testkit')
const path = require('path')

const testdata = path.join(__dirname, '../testdata')
const { Nodes } = Testkit({
  TESTDATA_DIR: testdata,
})
const rundir = path.join(testdata, 'custom')
const genesisNode = new Nodes.GenesisNode({
  rundir,
  id: 'genesis-node',
})
const { genesisUnit, genesisAddress } = await genesisNode.createGenesis()

// Hub will be created and started after genesis node because hub needs to know genesis unit and its main witness(genesis node)
const hub = new Nodes.ObyteHub({
  rundir: rundir,
  genesisUnit: genesisUnit,
  initialWitnesses: [genesisAddress],
  id: 'obyte-hub',
})

await genesisNode.ready()
await hub.ready()
// wait for genesis node to login to hub node
await genesisNode.loginToHub()

const wallet = new Nodes.HeadlessWallet({
  rundir: rundir,
  genesisUnit: genesisUnit,
  id: 'headless-wallet-1',
})
await wallet.ready()

const walletAddress = await wallet.getAddress()

// do something usefull here ...

await genesisNode.stop()
await wallet.stop()
await hub.stop()
```
</details>

## Common node methods

Methods described in this section are applicable for any node

#### __`node.ready()`__ *`: Promise<>`*

__Returns__ *Promise* that resolves when node child will be ready to operate

---------------------------------------

#### __`node.stop()`__ *`: Promise<>`*

__Returns__ *Promise* that resolves when node child exited its process

---------------------------------------

#### __`node.stabilize()`__ *`: Promise<mci: number>`*

__Returns__ *Promise* that resolves to Main Chain Index when node child receives `mci_became_stable` event

---------------------------------------

#### __`node.waitForNewJoint()`__ *`: Promise<joint>`*

__Returns__ *Promise* that resolves to `joint` object when node child receives and validates new joint

<details>
<summary>Joint object example</summary>

```javascript
{
  unit:
  {
    version: '2.0dev',
    alt: '3',
    messages: [ [Object] ],
    authors: [ [Object] ],
    timestamp: 1576682858,
    parent_units: [ 'A7QwnTCN2kKspj8Mfs5MQGkM9oMoaMvZmIQzq3VWZEM=' ],
    last_ball: '0hlnU+5lXnT5s8j22DJQ6OYPdRI3ymqJ1JG0zvcJ9OE=',
    last_ball_unit: 'jrEkfzJMZ6mSituUJBN/YOjO56rkopZPT04JGfs6BSo=',
    witness_list_unit: 'kTGo2ttgTUkj8bjF6lWKL+afeJm3OIjO+wUJBe0a0fc=',
    headers_commission: 402,
    payload_commission: 197,
    unit: 'ZvGvEjo7/nZ5P70XAGzafqcjqeeww/1mT6zi/fVTfUk='
  }
}
```

</details>

---------------------------------------

#### __`node.timetravel({ to, shift })`__ *`: Promise<{ error: string }>`*

Send the command to node child to change its time. This can be helpful for testing time-dependent AA.

> **Note:** Timetravel should be used only after every node has been started. Running a node after timetravel can lead to network inconsistency.

__Returns__ *Promise* that resolves to `{ error }` when node child receives `mci_became_stable` event. `error` will be null if timetravel was successfull

#### Parameters

*`to`* - new time of the network. Can be either a timestamp or a string in the valid format of `Date()` function

*`shift`* - an offset for a current network time. You can pass a `Number` for a milliseconds or a `String` in format `%number%duration`

| %duration | Example | Result              |
|:---------:|:-------:|---------------------|
|    's'    |   '5s'  | shift in 5 seconds  |
|    'm'    |  '10m'  | shift in 10 minutes |
|    'h'    |  '24h'  | shift in 24 hours   |
|    'd'    |  '365d' | shift in 365 days   |

If both of `to` and `shift` are present, `to` will be used

---------------------------------------

#### __`node.getTime()`__ *`: Promise<{ time: number }>`*

Receive details about unit from node. Uses `ocore/storage.readJoint` method

*Promise* resolves as `{ time }` object and `time` is in milliseconds

---------------------------------------

#### __`node.getLastMCI()`__ *`: Promise<mci: number>`*

Get node last Main Chain Index

*Promise* resolves as `mci`

---------------------------------------

#### __`node.getUnitInfo({ unit })`__ *`: Promise<{ unitObj, error }>`*

Receive details about unit from node. Uses `ocore/storage.readJoint` method

*Promise* resolves as `{ unitObj, error }`. Error will be null if everything is ok

#### Parameters

*`unit : String`* - unit to get info about

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')

const { Network } = Testkit()
const network = await Network.create()

const genesis = await network.getGenesisNode().ready()

const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()

const { unit, error } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
await network.witnessUntilStable(unit)

const { unitObj, error } = await wallet.getUnitInfo({ unit: unit })
await network.stop()
```
</details>

<details>
<summary>UnitObj example</summary>

```javascript
{
  "version": "2.0dev",
  "alt": "3",
  "messages": [
    {
      "app": "payment",
      "payload_location": "inline",
      "payload_hash": "5RTdFnLEHBjY21RltWguOazPNePfnU5LtOR+9VqrFa0=",
      "payload": {
        "outputs": [
          {
            "address": "EGPUJ2WKQMMOD75BMX5YJNYM2BWA22B5",
            "amount": 989401
          },
          {
            "address": "PVMCXUZBEHCFWOLXUDQVNCQZ476LNEW4",
            "amount": 10000
          }
        ],
        "inputs": [
          {
            "unit": "9Iw/Lh1a8ESX/1i+38gzcKeKUwu6TJLefEo7v2oQL6o=",
            "message_index": 0,
            "output_index": 1
          }
        ]
      }
    }
  ],
  "authors": [
    {
      "address": "E5O6LEUDV7QMGFCRF2NGAI65UWSZTXR2",
      "authentifiers": {
        "r": "9c6rYZMJojuiXOErgcxKtj7uoCbQVyX4zfAUJRHGv3Yjlpy30fWThwijedTl6eav7T9f28xfSzPOj9mPW7MzoQ=="
      },
      "definition": [
        "sig",
        {
          "pubkey": "A6V7juMjcMYwf/Cb7agvWYuMbPK79BgX2r0twuIM2JjF"
        }
      ]
    }
  ],
  "timestamp": 1572427125,
  "parent_units": [
    "7Geraevi9Sj3gcdaZH/Rf9AU2V6Caja5TbH4a5+Fwnc="
  ],
  "last_ball": "oXWxUu7e8PyNqOJoHaDFZIwOjtWCSJGV5L4zbhbWn0E=",
  "last_ball_unit": "vHbaBbjajc90AY1/2sDohehFE9Rha0skDnwKnmiWMGc=",
  "witness_list_unit": "RlBMDxYFXnYjlPHyS4GGevPiYZJR5a3xNao0/mHQXRY=",
  "headers_commission": 402,
  "payload_commission": 197,
  "unit": "BKf6iaQFZEd9TzsHrg+IDtN1KHjHMYB2zxn8rZZqNcs=",
  "main_chain_index": 7
}
```
</details>

---------------------------------------

#### __`node.getUnitProps({ unit })`__ *`: Promise<{ unitProps }>`*

Receive unit props.

*Promise* resolves as `{ unitProps }`

#### Parameters

*`unit : String`* - unit to get info about

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')

const { Network } = Testkit()
const network = await Network.create()

const genesis = await network.getGenesisNode().ready()

const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()

const { unit, error } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
await network.witnessUntilStable(unit)

const { unitProps } = await wallet.getUnitProps({ unit: unit })
await network.stop()
```
</details>

<details>
<summary>UnitProps example</summary>

```javascript
{
  unit: 'WhTBfbZK9k1/SxiINGarg455SdpiQNloBdrzbcO29Lo=',
  timestamp: 1574685652,
  level: 1,
  latest_included_mc_index: 0,
  main_chain_index: 1,
  is_on_main_chain: 1,
  is_free: 0,
  is_stable: 1,
  witnessed_level: 0,
  headers_commission: 355,
  payload_commission: 197,
  sequence: 'good',
  author_addresses: ['ZWDAO5YRB3SQZWAOGVNS4NADGIR3RB7Z'],
  witness_list_unit: 'PdiMP8/V2dks18gIP5foxy4WWFYwyURkKyCXQfkZjPU=',
  parent_units: ['PdiMP8/V2dks18gIP5foxy4WWFYwyURkKyCXQfkZjPU='],
}
```
</details>

---------------------------------------

#### __`node.readAAStateVars(address)`__ *`: Promise<{ vars }>`*

Retrieve current network vars state of agent

__Returns__ *Promise* that resolves to `{ vars }` where `vars` - state object of agent

#### Parameters

*`address : String`* - address of agent to retrieve state from

<details>
<summary>Agent Deployment example</summary>

See [Agent deployment test example](#Test-Examples)
</details>

---------------------------------------

## GenesisNode

Genesis node main function is to start new network and create genesis unit. After this, genesis node serves as witness and source of Bytes. At the moment of network genesis, this node puts on its account `10e15` Bytes

### GenesisNode constructor params

|  Property  |   Type  | Required |       Default      | Description                                                                 |
|:----------:|:-------:|:--------:|:------------------:|-----------------------------------------------------------------------------|
|     id     |  String |   true   |                    | Unique id of this node. Also determines node folder in `testdata` directory |
|   rundir   |  String |   true   |                    | Determines where this node will store its data. Absolute path               |
| passphrase |  String |   false  |      `'0000'`      | Passphrase used for headless-wallet                                         |
|     hub    |  String |   false  | `'localhost:6611'` | Address of hub to connect                                                   |

### GenesisNode methods

#### __`genesis.createGenesis()`__ *`: Promise<{ genesisUnit, genesisAddress }>`*

Creates network with new genesis unit.

__Returns__ *Promise* that resolves when genesis complete. *Promise* resolves to `{ genesisUnit, genesisAddress }`

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const path = require('path')

const testdata = path.join(__dirname, '../testdata')
const { Nodes } = Testkit({
  TESTDATA_DIR: testdata,
})
const rundir = path.join(testdata, 'custom')
const genesisNode = new Nodes.GenesisNode({
  rundir,
  id: 'genesis-node',
})
const { genesisUnit, genesisAddress } = await genesisNode.createGenesis()
```
</details>

---------------------------------------

#### __`genesis.loginToHub()`__ *`: Promise<>`*

Send the command to node child to connect to hub. Usefull at network genesis, because hub node starts after genesis node.

__Returns__ *Promise* that resolves when node connected to hub
</details>

---------------------------------------

#### __`genesis.postWitness()`__ *`: Nothing`*

Broadcast new witness to network. Returns nothing and does not wait for joint to be broadcasted to other nodes. To wait for stabilization use `stabilize` method from [Common node methods](#Common-node-methods)

__Returns__ nothing

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const path = require('path')

const testdata = path.join(__dirname, '../testdata')
const { Nodes } = Testkit({
  TESTDATA_DIR: testdata,
})
const rundir = path.join(testdata, 'custom')
const genesisNode = new Nodes.GenesisNode({
  rundir,
  id: 'genesis-node',
})
const { genesisUnit, genesisAddress } = await genesisNode.createGenesis()

const hub = new Nodes.ObyteHub({
  rundir: rundir,
  genesisUnit: genesisUnit,
  initialWitnesses: [genesisAddress],
  id: 'obyte-hub',
})

await genesisNode.ready()
await hub.ready()
await genesisNode.loginToHub()

const wallet = new Nodes.HeadlessWallet({
  rundir: rundir,
  genesisUnit: genesisUnit,
  id: 'headless-wallet-1',
})
await wallet.ready()

const walletAddress = await wallet.getAddress()
// get something to witness
const { unit, error } = await genesisNode.sendBytes({ toAddress: walletAddress, amount: 1000000 })

const stabilization = Promise.all([genesisNode.stabilize(), hub.stabilize()])
genesisNode.postWitness()
await stabilization
await genesisNode.stop()
await hub.stop()
await wallet.stop()
```
</details>

---------------------------------------

#### __`genesis.getAddress()`__ *`: Promise<address>`*

Request node address from child.

__Returns__ *Promise* that resolves to node address

---------------------------------------

#### __`genesis.sendBytes({ toAddress, amount })`__ *`: Promise<{ unit, error }>`*

Send Bytes to address

__Returns__ *Promise* that resolves to `{ unit, error }` after Bytes are sent. `error` will be null if sending was successfull

#### Parameters

*`toAddress : String`* - address of node that will receive Bytes

*`amount : Number`* - amount of Bytes to send

---------------------------------------

## ObyteHub

Obyte hub node serves as transport for network. Node receives incomming messages and broadcats them to other nodes

### ObyteHub constructor params

|     Property     |       Type      | Required | Default | Description                                                                 |
|:----------------:|:---------------:|:--------:|:-------:|-----------------------------------------------------------------------------|
|        id        |      String     |   true   |         | Unique id of this node. Also determines node folder in `testdata` directory |
|      rundir      |      String     |   true   |         | Determines where this node will store its data. Absolute path               |
|    genesisUnit   |      String     |   true   |         | The very first unit of the network                                          |
|       port       |      Number     |   false  |   6611  | Port the hub will be running on                                             |
| initialWitnesses |  Array[String]  |   true   |         | Trusted witnesses of this node                                              |

### ObyteHub methods

ObyteHub node does not have any special methods except [common node methods](#Common-node-methods)

## HeadlessWallet

Headless wallet node provides common network node functionality. It can receive Bytes, send Bytes and broadcast messages

### HeadlessWallet constructor params

|     Property    |   Type  | Required |       Default      | Description                                                                 |
|:---------------:|:-------:|:--------:|:------------------:|-----------------------------------------------------------------------------|
|        id       |  String |   true   |                    | Unique id of this node. Also determines node folder in `testdata` directory |
|      rundir     |  String |   true   |                    | Determines where this node will store its data. Absolute path               |
|    passphrase   |  String |   false  |      `'0000'`      | Passphrase used for headless-wallet                                         |
|   genesisUnit   |  String |   true   |                    | The very first unit of the network                                          |
|       hub       |  String |   false  | `'localhost:6611'` | Address of the hub to connect                                               |
| isSingleAddress | Boolean |   false  |        true        | Defines if node will operate in single address mode                         |

### HeadlessWallet methods

#### __`wallet.getAddress()`__ *`: Promise<address>`*

Request node address from child.

__Returns__ *Promise* that resolves to node address

---------------------------------------

#### __`wallet.getBalance()`__ *`: Promise<balanceObject>`*

Retrieve node balance from child.

__Returns__ *Promise* that resolves to node balance object

<details>
<summary>Balance object example</summary>

```javascript
{
   base:{
      stable:0,
      pending:49401,
      is_private:null
   }
}
```
</details>

---------------------------------------

#### __`wallet.sendBytes({ toAddress, amount })`__ *`: Promise<{ unit, error }>`*

Send Bytes to address

__Returns__ *Promise* that resolves to `{ unit, error }` after Bytes are sent. `error` will be null if sending was successfull

#### Parameters

*`toAddress : String`* - address of node that will receive Bytes

*`amount : Number`* - amount of Bytes to send

---------------------------------------

#### __`wallet.triggerAaWithData({ toAddress, amount, data })`__ *`: Promise<{ unit, error }>`*

Trigger AA execution with some data

__Returns__ *Promise* that resolves to `{ unit, error }` after data is sent. `error` will be null if sending was successfull

#### Parameters

*`toAddress : String`* - address of AA to trigger

*`amount : Number`* - amount of Bytes to send to AA

*`data : Object`* - key:value pairs object of data that will be passed to the AA

---------------------------------------

#### __`wallet.sendMulti(opts)`__ *`: Promise<{ unit, error }>`*

Allows to broadcast arbitrary message to network. Opts object is passed directly to [`issueChangeAddressAndSendMultiPayment`](https://developer.obyte.org/payments/data#data-with-any-structure) method of `headless-wallet`

__Returns__ *Promise* that resolves to `{ unit, error }` after message is sent. `error` will be null if sending was successfull

#### Parameters

*`opts : Object`* - arbitrary message to broadcast

---------------------------------------

#### __`wallet.deployAgent(source)`__ *`: Promise<{ address, unit, error }>`*

Deploy an agent in the network.

__Returns__ *Promise* that resolves to `{ address, unit, error }`, where `address` is the address of deployed agent and `unit` determines unit where agent was deployed. `error` will be null on success

#### Parameters

*`source : Path | String | OJSON`* - source of AA, can be:
  * an absolute path to a file containing plaintext agent
  * an absolute path to a javascript file that exports agent string
  * an absolute path to a javascript file that exports object in OJSON format
  * String with valid AA
  * Javascript object in OJSON format

<details>
<summary>Example</summary>

```javascript
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

const deployer = await network.newHeadlessWallet().ready()
const deployerAddress = await deployer.getAddress()

// send some bytes to AgentDeployer so it will be able to broadcast message with agent to the network
const { unit, error } = await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
await network.witnessUntilStable(unit)

// agent in OJSON fromat
const agent = {
  bounce_fees: { base: 10000 },
  messages: [
    {
      app: 'state',
      state: `{
        var['constant_var'] = 'constant_var';
        var['trigger_var'] = trigger.data.var;
        var['sum_var'] = 123 + 456;
      }`
    }
  ]
}

// deploy agent and confirm it on the network
const { address, unit, error } = await deployer.deployAgent(agent)
await network.witnessUntilStable(unit)
await network.stop()
```
</details>

---------------------------------------

#### __`wallet.getOwnedAddresses()`__ *`: Promise<Array[String]>`*

Retreive the array of addresses, owned by this wallet

__Returns__ *Promise* that resolves to array of string associated with `wallet` after message is sent.

---------------------------------------

## ObyteExplorer

Obyte explorer node provides DAG explorer of the network for visualization and debugging purposes

## ObyteExplorer constructor params

|     Property     |       Type      | Required |       Default      | Description                                                                 |
|:----------------:|:---------------:|:--------:|:------------------:|-----------------------------------------------------------------------------|
|        id        |      String     |   true   |                    | Unique id of this node. Also determines node folder in `testdata` directory |
|      rundir      |      String     |   true   |                    | Determines where this node will store its data. Absolute path               |
|    genesisUnit   |      String     |   true   |                    | The very first unit of the network                                          |
|      webPort     |      Number     |   false  |        8080        | Port theDAG explorer will be started on                                     |
| initialWitnesses |  Array[String]  |   true   |                    | Trusted witnesses of this node                                              |
|        hub       |      String     |   false  | `'localhost:6611'` | Address of the hub to connect                                               |

### ObyteExplorer methods

ObyteExplorer node does not have any special methods except [common node methods](#Common-node-methods)

<details>
<summary>ObyteExplorer creation example</summary>

```javascript
const { Testkit } = require('aa-testkit')

const { Network } = Testkit()
const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

// to have something to display in explorer
const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()

const { unit: unit1 } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
await network.witnessUntilStable(unit1)
const { unit: unit2 } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
await network.witnessUntilStable(unit2)

// by default DAG explorer will be started on http://localhost:8080
const explorer = await network.newObyteExplorer().ready()
```
</details>

---------------------------------------

## Utils

Utils and helpers from `aa-testkit`. Can be imported from the package

```javascript
const { Utils } = require('aa-testkit')
// sleep 5 seconds
await Utils.sleep(5000)
```

#### __`Utils.sleep(ms)`__ *`: Promise<>`*

Pause test execution for `ms` number of milliseconds. Returns `Promise`

---------------------------------------

#### __`Utils.isValidAddress(address)`__ *`: Boolean`*

Helper for address validation. Return `true` if passed argument is valid network address, `false` otherwise.

---------------------------------------

#### __`Utils.isValidBase64(b64, len)`__ *`: Boolean`*

Helper for base64 strings validation. Return `true` if passed argument is valid network address, `false` otherwise.

#### Parameters

*`b64`* - string to validate

*`len`* - optional. Length of the string. Function also validates length if second parameter is present

---------------------------------------

#### __`Utils.asyncStartHeadlessWallets(network, n)`__ *`: Primise<Array>`*

Util that starts `n` of `HeadlessWallet` nodes asynchronously. Helps to speed up test execution when starting a lot of `HeadlessWallet` nodes.

__Returns__ Returns `Promise` that resolves to Array of `HeadlessWallets`:

#### Parameters

*`network`* - network to start nodes on

*`n`* - number of nodes to start

<details>
<summary>Example</summary>

```javascript
const { Testkit, Utils } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

const [wallet1, wallet2, wallet3] = await Utils.asyncStartHeadlessWallets(network, 3)
await network.stop()
```
</details>

<details>
<summary>Mocha Example</summary>

This could be helpfull if you want to assign created wallets to `this` in `mocha` tests

```javascript
this.network = await Network.create()
this.genesis = await this.network.getGenesisNode().ready()

this.teamRed = {}
this.teamBlue = {}; // mind the semicolon. Otherwise use of destructuring assignment on the next line will lead to incorrect syntax.
[
  this.deployer,
  this.teamRed.founder,
  this.teamRed.alice,
  this.teamRed.bob,
  this.teamBlue.founder,
  this.teamBlue.mark,
  this.teamBlue.eva,
] = await Utils.asyncStartHeadlessWallets(this.network, 7)
```
</details>

---------------------------------------

#### __`Utils.countCommissionInUnits(node, units)`__ *`: Promise(commissions)`*

Helper to count headers and payload commissions in units.

__Returns__ Returns `Promise` that resolves to object:

```javascript
{
  error,
  total_headers_commission,
  total_payload_commission
}
```

`total_headers_commission` is the sum of headers commissions from passed units.

`total_payload_commission` is the sum of payload commissions from passed units.

`error` will be `null` if no errors present.

`error` will be the first faced error otherwise.

`total_payload_commission` and `total_headers_commission` will be `null` if `error` is present

#### Parameters

*`node`* - any running node that supports `node.getUnitInfo`

*`units`* - array of unit hashes to count the commissions on

<details>
<summary>Example</summary>

```javascript
const { Testkit, Utils } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

const wallet = await network.newHeadlessWallet().ready()
const { unit, error } = await genesis.sendBytes({
  toAddress: await wallet.getAddress(),
  amount: 1e9,
})

const commissions = await Utils.countCommissionInUnits(wallet, [unit])
await network.stop()
```
</details>

---------------------------------------

## Test Examples

<details>
<summary>Setup network and send some payments over the network</summary>

```javascript
const assert = require('assert')
const { Testkit } = require('aa-testkit')
const path = require('path')

const testdata = path.join(__dirname, '../testdata')
const { Network } = Testkit({
  TESTDATA_DIR: testdata,
})

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

const alice = await network.newHeadlessWallet().ready()
const bob = await network.newHeadlessWallet().ready()

const aliceAddress = await alice.getAddress()
const bobAddress = await bob.getAddress()

const { unit: unit1 } = await genesis.sendBytes({ toAddress: aliceAddress, amount: 100000 })
await network.sync()

let aliceBalance = await alice.getBalance()
assert(aliceBalance.base.pending === 100000)
await network.witnessUntilStable(unit1)

aliceBalance = await alice.getBalance()
assert(aliceBalance.base.stable === 100000)

const { unit: unit2 } = await alice.sendBytes({ toAddress: bobAddress, amount: 50000 })
await network.sync()

aliceBalance = await alice.getBalance()
assert(aliceBalance.base.pending === 49401)

let bobBalance = await bob.getBalance()
assert(bobBalance.base.pending === 50000)

await network.witnessUntilStable(unit2)

aliceBalance = await alice.getBalance()
assert(aliceBalance.base.stable === 49756)

bobBalance = await bob.getBalance()
assert(bobBalance.base.stable === 50000)

await network.stop()
```
</details>

<details>
<summary>Agent deployment and reading state vars</summary>

```javascript
const assert = require('assert')
const { Testkit } = require('aa-testkit')
const isValidAddress = require('ocore/validation_utils').isValidAddress
const path = require('path')

const agentString = `{
  bounce_fees: { base: 10000 },
  messages: [
    {
      app: 'state',
      state: "{
        var['constant_var'] = 'constant_var';
        var['trigger_var'] = trigger.data.var;
        var['sum_var'] = 123 + 456;
      }"
    }
  ]
}`

const testdata = path.join(__dirname, '../testdata')
const { Network } = Testkit({
  TESTDATA_DIR: testdata,
})

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

// agent deployment
const deployer = await network.newHeadlessWallet().ready()
const deployerAddress = await deployer.getAddress()

const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()

await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
const { unit } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
await network.witnessUntilStable(unit)

const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(agentString)

assert(isValidAddress(agentAddress))
await network.witnessUntilStable(agentUnit)

// reading state vars
const { unit } = await wallet.triggerAaWithData({
  toAddress: agentAddress,
  amount: 10000,
  data: {
    var: 'trigger_var',
  },
})

await network.witnessUntilStable(unit)

const { vars } = await deployer.readAAStateVars(agentAddress)

assert(vars.constant_var === 'constant_var')
assert(vars.trigger_var === 'trigger_var')
assert(vars.sum_var === '579')

await network.stop()
```
</details>

<details>
<summary>Time-dependent AA and network timetravel feature</summary>

```javascript
const assert = require('assert')
const { Testkit } = require('aa-testkit')
const isValidAddress = require('ocore/validation_utils').isValidAddress
const path = require('path')

const agentString = `{
  bounce_fees: { base: 10000 },
  init: '{
    $future_ts = 1893456000; // Jan 1, 2030
  }',
  messages: {
    cases: [
      {
        if: '{timestamp > $future_ts}',
        messages: [
          {
            app: 'state',
            state: '{
              var['time'] = 'future';
            }'
          },
        ]
      },
      {
        if: '{timestamp <= $future_ts}',
        messages: [
          {
            app: 'state',
            state: '{
              var['time'] = 'past';
            }'
          },
        ]
      }
    ]
  }
}`

const testdata = path.join(__dirname, '../testdata')
const { Network } = Testkit({
  TESTDATA_DIR: testdata,
})

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

// agent deployment
const deployer = await network.newHeadlessWallet().ready()
const deployerAddress = await deployer.getAddress()

const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()

await genesis.sendBytes({ toAddress: deployerAddress, amount: 1000000 })
const { unit } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1000000 })
await network.witnessUntilStable(unit)

const { address: agentAddress, unit: agentUnit } = await deployer.deployAgent(agentString)

assert(isValidAddress(agentAddress))
await network.witnessUntilStable(agentUnit)

const { unit: unitBeforeTravel } = await wallet.sendBytes({
  toAddress: agentAddress,
  amount: 10000,
})
await network.witnessUntilStable(unitBeforeTravel)

// check state vars before timetravel
let state = await deployer.readAAStateVars(agentAddress)
assert(state.vars.time === 'past')

// Timetravel network
const { error } = await network.timetravel({ to: '2050-01-01' })

const { unit: unitAfterTravel } = await wallet.sendBytes({
  toAddress: agentAddress,
  amount: 10000,
})
await network.witnessUntilStable(unitAfterTravel)

state = await deployer.readAAStateVars(agentAddress)

assert(state.vars.time === 'future')

await network.stop()
```
</details>

<details>
<summary>Get unit info</summary>

```javascript
const assert = require('assert')
const { Testkit } = require('aa-testkit')
const path = require('path')

const testdata = path.join(__dirname, '../testdata')
const { Network } = Testkit({
  TESTDATA_DIR: testdata,
})

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()

const wallet = await network.newHeadlessWallet().ready()

const walletAddress = await wallet.getAddress()

const { unit } = await genesis.sendBytes({ toAddress: walletAddress, amount: 100000 })
await network.witnessUntilStable(unit)

const { unitObj, error } = await wallet.getUnitInfo({ unit })
assert(error === null)

assert(unitObj.hasOwnProperty('unit'))
assert(unitObj.hasOwnProperty('ball'))

assert(unitObj.unit.hasOwnProperty('version'))
assert(unitObj.unit.hasOwnProperty('alt'))
assert(unitObj.unit.hasOwnProperty('messages'))
assert(unitObj.unit.hasOwnProperty('authors'))
assert(unitObj.unit.hasOwnProperty('timestamp'))
assert(unitObj.unit.hasOwnProperty('parent_units'))
assert(unitObj.unit.hasOwnProperty('last_ball'))
assert(unitObj.unit.hasOwnProperty('last_ball_unit'))
assert(unitObj.unit.hasOwnProperty('witness_list_unit'))
assert(unitObj.unit.hasOwnProperty('headers_commission'))
assert(unitObj.unit.hasOwnProperty('payload_commission'))

assert(unitObj.unit.hasOwnProperty('unit'))
assert(unitObj.unit.unit === unit)

assert(unitObj.unit.hasOwnProperty('main_chain_index'))
assert(unitObj.unit.main_chain_index === 1)

await network.stop()
```
<details>
<summary>unitObj content</summary>

```javascript
{
  "unit": {
    "version": "2.0dev",
    "alt": "3",
    "messages": [
      {
        "app": "payment",
        "payload_location": "inline",
        "payload_hash": "rIqo7sri7Vt9yR/P22zd2UNAM6lNx9eJtTsO8Dp2WUI=",
        "payload": {
          "outputs": [
            {
              "address": "KMGCRWPAWBR4G66J5ZPYV2YLYCZ7MS7T",
              "amount": 100000
            },
            {
              "address": "MF3BUCZD4ACJWEJH7R6FA5XP23WPYK2M",
              "amount": 899448
            }
          ],
          "inputs": [
            {
              "unit": "dnAsJUmfXLEoQEBk2bZ0zKLBChSqfCWUalUOhokQ/x8=",
              "message_index": 0,
              "output_index": 0
            }
          ]
        }
      }
    ],
    "authors": [
      {
        "address": "2VEZBTGBZAQBRUPLMN4QTCN5YHJ5ZIS7",
        "authentifiers": {
          "r": "Z8Ucy7+yVio6jlvzi2C/ig6IF0fHVYW6idV674rHT2Bn3FV+/XkIrHQ0ClHNKT1iMQwilMLycWnNKmN8adqSSw=="
        }
      }
    ],
    "timestamp": 1572446684,
    "parent_units": [
      "dnAsJUmfXLEoQEBk2bZ0zKLBChSqfCWUalUOhokQ/x8="
    ],
    "last_ball": "THj5ba6gkebexKppJVp4TyJ3Qhq9CKSOmSQST7Zifz4=",
    "last_ball_unit": "dnAsJUmfXLEoQEBk2bZ0zKLBChSqfCWUalUOhokQ/x8=",
    "witness_list_unit": "dnAsJUmfXLEoQEBk2bZ0zKLBChSqfCWUalUOhokQ/x8=",
    "headers_commission": 355,
    "payload_commission": 197,
    "unit": "oGv2HJtcC/SILJfHXo44x43PCHds+HAhnouaqyVD/yE=",
    "main_chain_index": 1
  },
  "ball": "mj9Cze6RocUcuQlLT6G5XOG1UWv28tUSQoYU3YNgUhQ="
}
```
</details>

</details>

<details>
<summary>Get AA execution response</summary>

```javascript
const agentString = `{
  bounce_fees: { base: 10000 },
  messages: [
    {
      init: '{
        $datafeed = trigger.data.dataFeedPayload;
        response['dataFeedAaResponse'] = 'aa response!';
      }',
      app: 'data_feed',
      payload: {
        dataFeedPayload: '{
          if ($datafeed)
            return $datafeed;
          'no datafeed provided'
        }'
      }
    }
  ]
}`

const assert = require('assert')
const { Testkit } = require('aa-testkit')
const { Network } = Testkit()

const network = await Network.create()
const genesis = await network.getGenesisNode().ready()
const explorer = await network.newObyteExplorer().ready()

const deployer = await network.newHeadlessWallet().ready()
const deployerAddress = await deployer.getAddress()

const wallet = await network.newHeadlessWallet().ready()
const walletAddress = await wallet.getAddress()

const { unit: unit1 } = await genesis.sendBytes({ toAddress: walletAddress, amount: 1e9 })
await network.witnessUntilStable(unit1)

const { unit: unit2 } = await genesis.sendBytes({ toAddress: deployerAddress, amount: 1e9 })
await network.witnessUntilStable(unit2)

const { address: agentAddress, unit: agentDeploymentUnit, error: agentDeploymentError } = await deployer.deployAgent(agentString)

await network.witnessUntilStable(agentDeploymentUnit)

const { unit, error } = await wallet.triggerAaWithData({
  toAddress: agentAddress,
  amount: 10000,
  data: {
    dataFeedPayload: 'this will be a datafeed',
  },
})

await network.witnessUntilStable(unit)
const { response } = await network.getAaResponseToUnit(unit)

assert(response.response.responseVars.dataFeedAaResponse === 'aa response!')

const aaResponseUnit = response.response_unit
const { unitObj, error: aaResponseUnitError } = await wallet.getUnitInfo({ unit: aaResponseUnit })

const dataFeedMessage = unitObj.unit.messages.find(e => e.app === 'data_feed')
assert(dataFeedMessage.payload.dataFeedPayload === 'this will be a datafeed')

await network.stop()
```
</details>

## Writing Tests With Mocha

Although `aa-testkit` can be used with any test runner or even without one, we recommend using [mocha](https://www.npmjs.com/package/mocha) for writing tests.

Some examples of mocha tests set up can be found inside `test` data of `aa-testkit` module

[Sending Payments](./test/core/payments.spec.js)

[AA deployment](./test/aa/just_a_bouncer.spec.js)

[AA state vars checking](./test/aa/vars_setting_check.spec.js)

[Timetravel feature](./test/aa/timetravel_check.spec.js)

[Retrieving AA response](./test/aa/aa_response.feature.spec.js)

