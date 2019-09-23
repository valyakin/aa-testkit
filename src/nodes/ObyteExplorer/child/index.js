
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

const explorer = require('obyte-explorer/explorer.js')
