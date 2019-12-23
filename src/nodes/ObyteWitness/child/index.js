const fs = require('fs')

const [,,
	id,
	genesisUnit,
] = process.argv
fs.mkdirSync(process.env.HOME, { recursive: true })

const conf = require('ocore/conf.js')
conf.deviceName = id

const constants = require('ocore/constants.js')
constants.GENESIS_UNIT = genesisUnit
console.log('constants.GENESIS_UNIT :', constants.GENESIS_UNIT)

require('obyte-witness')

// const headlessWallet = require('headless-obyte')
// const eventBus = require('ocore/event_bus.js')

process.send({ topic: 'password_required' })

// eventBus.once('headless_wallet_ready', function () {
//  process.send({ topic: 'started' })
// })
