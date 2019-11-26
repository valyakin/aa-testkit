const AbstarctMessage = require('./AbstarctMessage')

class CommandTriggerAa extends AbstarctMessage {
	constructor ({ data, toAddress, amount }) {
		super()
		this.topic = 'command_trigger_aa'
		this.amount = amount
		this.data = data
		this.toAddress = toAddress
	}
}

module.exports = CommandTriggerAa
