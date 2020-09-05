const AbstractMessage = require('./AbstractMessage')

class CommandCustom extends AbstractMessage {
	constructor ({ payload }) {
		super()
		this.topic = 'command_custom'
		this.payload = payload
	}
}

module.exports = CommandCustom
