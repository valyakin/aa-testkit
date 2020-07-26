const AbstractMessage = require('./AbstractMessage')

class CommandSignMessage extends AbstractMessage {
	constructor ({ message }) {
		super()
		this.topic = 'command_sign_message'
		this.message = message
	}
}

module.exports = CommandSignMessage
