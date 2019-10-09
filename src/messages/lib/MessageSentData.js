const AbstarctMessage = require('./AbstarctMessage')

class MessageSentData extends AbstarctMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'sent_data'
		this.unit = unit
	}
}

module.exports = MessageSentData
