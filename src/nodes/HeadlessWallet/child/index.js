const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageSentBytes,
	MessageMyAddress,
	MessageMyBalance,
	MessageChildReady,
	MessageChildError,
	MessagePasswordRequired,
} = requireRoot('src/messages')

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
			.on('command_get_balance', (m) => this.getBalance(m))
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
		console.log('sendBytes ({ toAddress, amount }) { :', { toAddress, amount })
		this.headlessWallet.issueChangeAddressAndSendPayment(null, amount, toAddress, null, (err, unit) => {
			if (err) {
				this.sendParent(new MessageChildError({ error: err }))
			} else {
				setTimeout(() => { this.sendParent(new MessageSentBytes({ unit })) }, 100)
			}
		})
	}

	getBalance () {
		this.headlessWallet.readSingleWallet(walletId => {
			const wallet = require('ocore/wallet')
			wallet.readBalance(walletId, (assocBalances) => {
				console.log('assocBalances', assocBalances)
				this.sendParent(new MessageMyBalance({ balance: assocBalances }))
			})
		})
	}
}

const child = new HeadlessWalletChild(process.argv)
child.start()
