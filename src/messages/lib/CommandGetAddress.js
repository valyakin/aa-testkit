const AbstractMessage = require('./AbstractMessage')

class CommandGetAddress extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_get_address'
	}
}

module.exports = CommandGetAddress
