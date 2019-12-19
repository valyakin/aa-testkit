const AbstarctMessage = require('./AbstarctMessage')

class CommandGetLastMCI extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_get_last_mci'
	}
}

module.exports = CommandGetLastMCI
