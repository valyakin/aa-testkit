const AbstarctMessage = require('./AbstarctMessage')

class CommandChildStop extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_child_stop'
	}
}

module.exports = CommandChildStop
