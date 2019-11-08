const AbstarctMessage = require('./AbstarctMessage')

class CommandTimeTravel extends AbstarctMessage {
	constructor ({ to, shift }) {
		super()
		this.topic = 'command_time_travel'
		this.shift = shift
		this.to = to
	}
}

module.exports = CommandTimeTravel
