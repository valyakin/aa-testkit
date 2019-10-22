const AbstarctMessage = require('./AbstarctMessage')

class MessageSentMulti extends AbstarctMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'sent_multi'
		this.unit = unit
	}
}

module.exports = MessageSentMulti
