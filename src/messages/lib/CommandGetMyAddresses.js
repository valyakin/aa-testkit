const AbstractMessage = require('./AbstractMessage')

class CommandGetMyAddresses extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_get_my_addresses'
	}
}

module.exports = CommandGetMyAddresses
