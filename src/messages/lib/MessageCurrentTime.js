const AbstarctMessage = require('./AbstarctMessage')

class MessageCurrentTime extends AbstarctMessage {
	constructor ({ time }) {
		super()
		this.topic = 'current_time'
		this.time = time
	}
}

module.exports = MessageCurrentTime
