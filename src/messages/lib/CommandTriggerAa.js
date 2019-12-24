const AbstractMessage = require('./AbstractMessage')

class CommandTriggerAa extends AbstractMessage {
	constructor ({ data, toAddress, amount }) {
		super()
		this.topic = 'command_trigger_aa'
		this.amount = amount
		this.data = data
		this.toAddress = toAddress
	}
}

module.exports = CommandTriggerAa
