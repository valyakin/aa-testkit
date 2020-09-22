const path = require('path')
const { Custom } = require('./kit')

class MyNode extends Custom.Node {
	childPath () {
		return path.join(__dirname, './MyChild')
	}

	getChash (data) {
		return new Promise(resolve => {
			this.once('chash', (chash) => resolve(chash))
			this.sendCustomCommand({ type: 'get-chash', data })
		})
	}

	getMyWitnesses () {
		return new Promise(resolve => {
			this.once('my-witnesses', (witnesses) => resolve(witnesses))
			this.sendCustomCommand({ type: 'get-my-witnesses' })
		})
	}

	handleCustomMessage (payload) {
		switch (payload.type) {
		case 'chash':
			this.emit('chash', payload.chash)
			break
		case 'my-witnesses':
			this.emit('my-witnesses', payload.witnesses)
			break
		}
	}
}

module.exports = MyNode
