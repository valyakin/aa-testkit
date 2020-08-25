const AbstractMessage = require('./AbstractMessage')

class MessageTimeTravelDone extends AbstractMessage {
	constructor ({ error, timestamp }) {
		super()
		this.topic = 'time_travel_done'
		this.error = error
		this.timestamp = timestamp
	}
}

module.exports = MessageTimeTravelDone
