const AbstarctMessage = require('./AbstarctMessage')

class CommandLoginToHub extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_login_to_hub'
	}
}

module.exports = CommandLoginToHub
