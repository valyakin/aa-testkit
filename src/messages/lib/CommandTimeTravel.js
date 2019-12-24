const AbstractMessage = require('./AbstractMessage')

class CommandTimeTravel extends AbstractMessage {
	constructor ({ to, shift }) {
		super()
		this.topic = 'command_time_travel'
		this.shift = shift
		this.to = to
	}
}

module.exports = CommandTimeTravel
