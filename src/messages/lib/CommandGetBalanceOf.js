const AbstractMessage = require('./AbstractMessage')

class CommandGetBalanceOf extends AbstractMessage {
	constructor ({ address }) {
		super()
		this.address = address
		this.topic = 'command_get_balance_of'
	}
}

module.exports = CommandGetBalanceOf
