const AbstarctMessage = require('./AbstarctMessage')

class CommandGetAddress extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_get_address'
	}
}

module.exports = CommandGetAddress
