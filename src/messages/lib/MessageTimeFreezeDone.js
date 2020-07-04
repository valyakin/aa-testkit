const AbstractMessage = require('./AbstractMessage')

class MessageTimeFreezeDone extends AbstractMessage {
	constructor ({ error }) {
		super()
		this.topic = 'time_freeze_done'
		this.error = error
	}
}

module.exports = MessageTimeFreezeDone
