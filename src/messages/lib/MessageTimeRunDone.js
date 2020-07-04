const AbstractMessage = require('./AbstractMessage')

class MessageTimeRunDone extends AbstractMessage {
	constructor ({ error }) {
		super()
		this.topic = 'time_run_done'
		this.error = error
	}
}

module.exports = MessageTimeRunDone
