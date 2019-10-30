const AbstarctMessage = require('./AbstarctMessage')

class MessageSentData extends AbstarctMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'sent_data'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageSentData
