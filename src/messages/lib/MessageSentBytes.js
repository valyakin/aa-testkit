const AbstarctMessage = require('./AbstarctMessage')

class MessageSentBytes extends AbstarctMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'sent_bytes'
		this.unit = unit
	}
}

module.exports = MessageSentBytes
