const AbstarctMessage = require('./AbstarctMessage')

class CommandTimeTravel extends AbstarctMessage {
	constructor ({ to }) {
		super()
		this.topic = 'command_time_travel'
		this.to = to
	}
}

module.exports = CommandTimeTravel
