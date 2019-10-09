const AbstarctMessage = require('./AbstarctMessage')

class CommandSendData extends AbstarctMessage {
	constructor ({ payload, toAddress, amount }) {
		super()
		this.topic = 'command_send_data'
		this.amount = amount
		this.payload = payload
		this.toAddress = toAddress
	}
}

module.exports = CommandSendData
