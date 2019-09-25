const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const { MessagePasswordRequired, MessageChildReady, MessageMyAddress, MessageChildError } = requireRoot('src/messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	genesisUnit: Joi.string().required(),
})

class HeadlessWalletChild extends AbstractChild {
	constructor (argv) {
		const params = HeadlessWalletChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_get_address', () => this.getAddress())
			.on('command_send_bytes', (m) => this.sendBytes(m))
	}

	static unpackArgv (argv) {
		const [,,
			id,
			genesisUnit,
		] = argv

		return {
			id,
			genesisUnit,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')

		this.sendParent(new MessagePasswordRequired())
		this.eventBus.once('headless_wallet_ready', () => {
			this.sendParent(new MessageChildReady())
		})
	}

	getAddress () {
		this.headlessWallet.readFirstAddress(address => {
			this.sendParent(new MessageMyAddress({ address }))
		})
	}

	sendBytes ({ toAddress, amount }) {
		console.log('!!!!!!!!!!+========+++!!!!!!!!!=here')
		this.headlessWallet.issueChangeAddressAndSendPayment(null, amount, toAddress, null, (err, unit) => {
			console.log('err, unit', err, unit)
			if (err) {
				this.sendParent(new MessageChildError({ error: err }))
			}
		})
	}
}

const child = new HeadlessWalletChild(process.argv)
child.start()

// const fs = require('fs')

// const [,,
// 	id,
// 	genesisUnit,
// ] = process.argv
// fs.mkdirSync(process.env.HOME, { recursive: true })

// const conf = require('ocore/conf.js')
// conf.deviceName = id

// const constants = require('ocore/constants.js')
// constants.GENESIS_UNIT = genesisUnit
// console.log('constants.GENESIS_UNIT :', constants.GENESIS_UNIT)

// const headlessWallet = require('headless-obyte')
// const eventBus = require('ocore/event_bus.js')

// process.send({ topic: 'password_required' })

// eventBus.once('headless_wallet_ready', function () {
// 	process.send({ topic: 'started' })
// })

// process.on('message', message => {
// 	if (message.topic === 'get_address') {
// 		headlessWallet.readFirstAddress(address => {
// 			process.send({ topic: 'address', address })
// 		})
// 	}
// })

// process.on('message', message => {
// 	if (message.topic === 'send_bytes') {
// 		headlessWallet.issueChangeAddressAndSendPayment(null, message.amount, message.toAddress, null, function (err, unit) {
// 			process.send({
// 				topic: 'bytes_sent',
// 				err,
// 				unit: err ? undefined : unit,
// 			})
// 		})
// 	}
// })
