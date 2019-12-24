const AbstractMessage = require('./AbstractMessage')

class CommandGetTime extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_get_time'
	}
}

module.exports = CommandGetTime
