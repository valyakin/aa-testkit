const AbstarctMessage = require('./AbstarctMessage')

class CommandGetTime extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_get_time'
	}
}

module.exports = CommandGetTime
