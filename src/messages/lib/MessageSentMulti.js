const AbstractMessage = require('./AbstractMessage')

class MessageSentMulti extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'sent_multi'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageSentMulti
