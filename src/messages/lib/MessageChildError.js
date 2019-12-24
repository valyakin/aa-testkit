const AbstractMessage = require('./AbstractMessage')

class MessageChildError extends AbstractMessage {
	constructor ({ error }) {
		super()
		this.topic = 'child_error'
		this.error = error
	}
}

module.exports = MessageChildError
