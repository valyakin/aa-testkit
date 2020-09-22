const HeadlessWalletChild = require('./HeadlessWalletChild')
const child = new HeadlessWalletChild(process.argv)
child.start()
