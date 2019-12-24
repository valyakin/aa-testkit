const AbstractMessage = require('./AbstractMessage')

class MessageMyBalance extends AbstractMessage {
	constructor ({ balance }) {
		super()
		this.topic = 'my_balance'
		this.balance = balance
	}
}

module.exports = MessageMyBalance
