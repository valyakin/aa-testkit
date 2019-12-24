const AbstractMessage = require('./AbstractMessage')

class CommandSendBytes extends AbstractMessage {
	constructor ({ toAddress, amount }) {
		super()
		this.topic = 'command_send_bytes'
		this.toAddress = toAddress
		this.amount = amount
	}
}

module.exports = CommandSendBytes
