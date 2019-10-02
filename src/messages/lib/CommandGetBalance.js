const AbstarctMessage = require('./AbstarctMessage')

class CommandGetBalance extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_get_balance'
	}
}

module.exports = CommandGetBalance
