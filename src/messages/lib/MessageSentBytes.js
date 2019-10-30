const AbstarctMessage = require('./AbstarctMessage')

class MessageSentBytes extends AbstarctMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'sent_bytes'
		this.unit = unit
		this.error = error
	}
}

module.exports = MessageSentBytes
