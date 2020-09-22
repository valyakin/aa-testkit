const { ChildrenManager } = require('../../sevices')
const path = require('path')
const HeadlessWallet = require('../HeadlessWallet/HeadlessWallet')
const {
	CommandCustom,
} = require('../../messages')

class CustomNode extends HeadlessWallet {
	constructor (params = {}) {
		super(params)
	}

	runChild (d, env) {
		const argv = this.packArgv()

		const options = {
			stdio: ['pipe', 'ignore', 'inherit', 'ipc'],
			cwd: path.join(__dirname, '/child'),
			env: {
				devnet: 1,
				LOCALAPPDATA: path.join(this.rundir, this.id),
				HOME: path.join(this.rundir, this.id),
				...env,
			},
			execArgv: [],
		}

		this.child = ChildrenManager.fork(this.childPath(), argv, options)
		this.subscribeEvents()

		this
			.on('custom', (m) => this.handleCustomMessage(m.payload))
	}

	childPath () {
		throw new Error('ChildNode childPath method must be implemented')
	}

	handleCustomMessage (payload) {
		// handle custom messages from child here
	}

	sendCustomCommand (payload) {
		this.sendToChild(new CommandCustom({ payload }))
	}
}

module.exports = CustomNode
