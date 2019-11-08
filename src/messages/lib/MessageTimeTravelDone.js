const AbstarctMessage = require('./AbstarctMessage')

class MessageTimeTravelDone extends AbstarctMessage {
	constructor ({ error }) {
		super()
		this.topic = 'time_travel_done'
		this.error = error
	}
}

module.exports = MessageTimeTravelDone
