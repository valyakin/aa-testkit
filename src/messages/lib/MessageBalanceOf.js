const AbstractMessage = require('./AbstractMessage')

class MessageBalanceOf extends AbstractMessage {
	constructor ({ balance }) {
		super()
		this.topic = 'balance_of'
		this.balance = balance
	}
}

module.exports = MessageBalanceOf
