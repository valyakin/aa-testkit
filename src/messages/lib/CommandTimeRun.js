const AbstractMessage = require('./AbstractMessage')

class CommandTimeRun extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_time_run'
	}
}

module.exports = CommandTimeRun
