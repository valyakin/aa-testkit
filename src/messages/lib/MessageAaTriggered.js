const AbstarctMessage = require('./AbstarctMessage')

class MessageAaTriggered extends AbstarctMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'aa_triggered'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageAaTriggered
