const AbstractMessage = require('./AbstractMessage')

class CommandTimeFreeze extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_time_freeze'
	}
}

module.exports = CommandTimeFreeze
