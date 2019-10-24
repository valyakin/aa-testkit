const AbstarctMessage = require('./AbstarctMessage')

class MessageTimeTravelDone extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'time_travel_done'
	}
}

module.exports = MessageTimeTravelDone
