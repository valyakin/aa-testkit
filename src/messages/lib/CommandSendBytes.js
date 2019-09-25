const AbstarctMessage = require('./AbstarctMessage')

class CommandSendBytes extends AbstarctMessage {
	constructor ({ toAddress, amount }) {
		super()
		this.topic = 'command_send_bytes'
		this.toAddress = toAddress
		this.amount = amount
	}
}

module.exports = CommandSendBytes
