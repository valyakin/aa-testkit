const AbstractMessage = require('./AbstractMessage')

class CommandSignUnit extends AbstractMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'command_sign_unit'
		this.unit = unit
	}
}

module.exports = CommandSignUnit
