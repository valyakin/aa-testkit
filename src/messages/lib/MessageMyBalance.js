const AbstarctMessage = require('./AbstarctMessage')

class MessageMyBalance extends AbstarctMessage {
	constructor ({ balance }) {
		super()
		this.topic = 'my_balance'
		this.balance = balance
	}
}

module.exports = MessageMyBalance
