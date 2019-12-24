const AbstractMessage = require('./AbstractMessage')

class MessageSentBytes extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'sent_bytes'
		this.unit = unit
		this.error = error
	}
}

module.exports = MessageSentBytes
