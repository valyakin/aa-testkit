# Change Log

## v0.3.2 (2020-06-25)

### Changes
1. `ocore` upgraded to version `0.3.11`

### Fixes
1. Fixed `Utils.hasOnlyTheseExternalPayments` function


## v0.3.1 (2020-06-11)

### Changes
1. Renamed `getFirstPubkey` to `getFirstAddress`

### Features
1. Added `node.getOutputsBalanceOf` method

### Fixes
1. Locked `secp256k1` version for better compatibility


## v0.3.0

### Changes
1. `ocore` upgraded to version `0.3.10`
2. config `DEFAULT_PASSPHRASE` option is now obsolete. Every wallet node pass is now `'0000'`

### Features
1. `ObyteWitness` node added
2. Added `.with.numberOfWitnesses()` feature which allows to change number of witnesses in the network. Default is `3`
3. `await node.waitForUnits(units)` method added
4. `mnemonic` option for wallet creation
5. `Utils.asyncStartHeadlessWalletsWithMnemonics` Utils method added
6. `Utils.getPubkey` method added
7. `Utils.generateMnemonic` method added
8. `Utils.getFirstPubkey` method added

### Fixes
1. `await node.waitForUnit(unit)` hangs test execution if `unit` issued by `node` itself

## v0.2.3

### Features
1. `node.getBalanceOf(address)` method added
2. `genesisNode.sendMulti(opts)` method added

### Fixes
1. Increase amount of bytes given to Genesis Node

## v0.2.2

### Features
1. Update ocore
2. with.explorer() network initializer

### Fixes
1. Fix `AbstractNode` for node v8

## v0.2.0

### Breaking Changes
1. `.run()` should be called after `Network.create()` for network to operate
2. Removed `stabilize` from AbstractNode

### Features
1. Added `with` set of helpers for `Network.create()` for easy wallets, agents and assets initialization

### Fixes
1. Fixed possible hang of the test on `network.witnessAndStabilize` call
