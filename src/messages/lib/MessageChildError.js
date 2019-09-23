const AbstarctMessage = require('./AbstarctMessage')

class MessageChildError extends AbstarctMessage {
	constructor ({ error }) {
		super()
		this.topic = 'child_error'
		this.error = error
	}
}

module.exports = MessageChildError
