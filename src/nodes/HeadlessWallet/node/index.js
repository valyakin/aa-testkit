
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

const headlessWallet = require('headless-obyte')
const eventBus = require('ocore/event_bus.js')

process.send({ topic: 'password_required' })

eventBus.once('headless_wallet_ready', function () {
	process.send({ topic: 'started' })
})

process.on('message', message => {
	if (message.topic === 'get_address') {
		headlessWallet.readFirstAddress(address => {
			process.send({ topic: 'address', address })
		})
	}
})

process.on('message', message => {
	if (message.topic === 'send_bytes') {
		headlessWallet.issueChangeAddressAndSendPayment(null, message.amount, message.toAddress, null, function (err, unit) {
			process.send({
				topic: 'bytes_sent',
				err,
				unit: err ? undefined : unit,
			})
		})
	}
})
