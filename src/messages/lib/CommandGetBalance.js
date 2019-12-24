const AbstractMessage = require('./AbstractMessage')

class CommandGetBalance extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_get_balance'
	}
}

module.exports = CommandGetBalance
