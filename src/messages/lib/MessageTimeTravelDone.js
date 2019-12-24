const AbstractMessage = require('./AbstractMessage')

class MessageTimeTravelDone extends AbstractMessage {
	constructor ({ error }) {
		super()
		this.topic = 'time_travel_done'
		this.error = error
	}
}

module.exports = MessageTimeTravelDone
