const HeadlessWalletChild = require('../../HeadlessWallet/child/HeadlessWalletChild')
const {
	MessageCustom,
} = require('../../../messages')

class CustomNodeChild extends HeadlessWalletChild {
	constructor () {
		super(process.argv)
	}

	start () {
		super.start()

		this.on('command_custom', (m) => this.handleCustomCommand(m.payload))
		this.run()
	}

	run () {
		throw new Error('CustomNode run method must be implemented')
	}

	handleCustomCommand (payload) {
		// handle custom commands here
	}

	sendCustomMessage (payload) {
		this.sendToParent(new MessageCustom({ payload }))
	}
}

module.exports = CustomNodeChild
