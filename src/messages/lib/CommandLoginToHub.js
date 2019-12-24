const AbstractMessage = require('./AbstractMessage')

class CommandLoginToHub extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_login_to_hub'
	}
}

module.exports = CommandLoginToHub
