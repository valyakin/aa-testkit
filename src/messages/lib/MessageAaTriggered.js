const AbstractMessage = require('./AbstractMessage')

class MessageAaTriggered extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'aa_triggered'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageAaTriggered
