const AbstractMessage = require('./AbstractMessage')

class MessageCurrentTime extends AbstractMessage {
	constructor ({ time }) {
		super()
		this.topic = 'current_time'
		this.time = time
	}
}

module.exports = MessageCurrentTime
