const AbstarctMessage = require('./AbstarctMessage')

class CommandSendBytes extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_send_bytes'
	}
}

module.exports = CommandSendBytes
