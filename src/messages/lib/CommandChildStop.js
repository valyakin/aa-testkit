const AbstractMessage = require('./AbstractMessage')

class CommandChildStop extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_child_stop'
	}
}

module.exports = CommandChildStop
