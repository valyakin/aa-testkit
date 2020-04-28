# Change Log

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
