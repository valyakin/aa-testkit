const AbstarctMessage = require('./AbstarctMessage')

class MessageChildReady extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'child_ready'
	}
}

module.exports = MessageChildReady
