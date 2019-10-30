const AbstarctMessage = require('./AbstarctMessage')

class MessageSentMulti extends AbstarctMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'sent_multi'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageSentMulti
