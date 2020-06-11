const AbstractMessage = require('./AbstractMessage')

class MessageOutputsBalanceOf extends AbstractMessage {
	constructor ({ balance }) {
		super()
		this.topic = 'outputs_balance_of'
		this.balance = balance
	}
}

module.exports = MessageOutputsBalanceOf
