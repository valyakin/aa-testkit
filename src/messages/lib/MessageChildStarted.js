const AbstarctMessage = require('./AbstarctMessage')

class MessageChildStarted extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'child_started'
	}
}

module.exports = MessageChildStarted
