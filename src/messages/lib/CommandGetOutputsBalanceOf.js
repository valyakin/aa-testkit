const AbstractMessage = require('./AbstractMessage')

class CommandGetOutputsBalanceOf extends AbstractMessage {
	constructor ({ address }) {
		super()
		this.address = address
		this.topic = 'command_get_outputs_balance_of'
	}
}

module.exports = CommandGetOutputsBalanceOf
