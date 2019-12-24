const AbstractMessage = require('./AbstractMessage')

class CommandGetLastMCI extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_get_last_mci'
	}
}

module.exports = CommandGetLastMCI
