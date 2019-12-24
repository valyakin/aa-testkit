const AbstractMessage = require('./AbstractMessage')

class MessageChildStarted extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'child_started'
	}
}

module.exports = MessageChildStarted
