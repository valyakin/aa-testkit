const AbstarctMessage = require('./AbstarctMessage')

class CommandGetMyAddresses extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_get_my_addresses'
	}
}

module.exports = CommandGetMyAddresses
