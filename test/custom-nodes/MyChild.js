const { Custom } = require('./kit')
const APP = require('./app')

class MyNodeChild extends Custom.Child {
	run () {
		this.app = new API()
	}

	async handleCustomCommand (payload) {
		switch (payload.type) {
		case 'get-chash':
			this.sendCustomMessage({ type: 'chash', chash: await this.app.getChash(payload.data) })
			break

		case 'get-my-witnesses':
			this.sendCustomMessage({ type: 'my-witnesses', witnesses: await this.app.getMyWitnesses(payload.data) })
			break
		}
	}
}

const child = new MyNodeChild(process.argv)
child.start()
