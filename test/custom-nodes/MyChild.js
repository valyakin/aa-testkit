const { Custom } = require('./kit')
const API = require('./api')

class MyNodeChild extends Custom.Child {
	run () {
		this.api = new API()
	}

	async handleCustomCommand (payload) {
		switch (payload.type) {
		case 'get-chash':
			this.sendCustomMessage({ type: 'chash', chash: await this.api.getChash(payload.data) })
			break

		case 'get-my-witnesses':
			this.sendCustomMessage({ type: 'my-witnesses', witnesses: await this.api.getMyWitnesses(payload.data) })
			break
		}
	}
}

const child = new MyNodeChild(process.argv)
child.start()
