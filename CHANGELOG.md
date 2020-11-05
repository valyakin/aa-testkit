# Change Log

## v0.3.13 (2020-11-05)

1. `.with.wallet` allows to specify wallet mnemonic

## v0.3.12 (2020-09-23)

1. Custom Nodes documentation

## v0.3.11 (2020-09-22)

1. `CustomNode` and `CustomNodeChild` added

## v0.3.10 (2020-08-31)

1. Remove `yarn.lock` file
2. Remove `crypto` module from dependencies(and use built-in `crypto`)

## v0.3.9 (2020-08-25)

1. `network.timetravel` method returns timestamp
2. `wallet.issueDivisibleAsset` method added
3. `wallet.issueIndivisibleAsset` method added

### Fixes
1. `with.asset` fixed for capped assets

## v0.3.8 (2020-07-30)

1. `node.executeGetter` method added
2. `wallet.signMessage` method added

## v0.3.7 (2020-07-22)

1. Added Quick Start section to README
2. Fixed node log stream end
3. Fix node 8 dev dependencies incompatibility

## v0.3.5 (2020-07-14)

### Fixes
1. Child processes cleanup on `testkit` exiting
2. Flush node log buffer on exit

## v0.3.3 (2020-07-04)

### Changes
1. `ocore` upgraded to version `0.3.12`

### Features
1. `Utils.getExternalPayments` method added
2. `network.timefreeze()` method added
3. `network.timerun()` method added

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
