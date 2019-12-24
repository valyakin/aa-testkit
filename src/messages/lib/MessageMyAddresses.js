const AbstractMessage = require('./AbstractMessage')

class MessageMyAddresses extends AbstractMessage {
	constructor ({ addresses }) {
		super()
		this.topic = 'my_addresses'
		this.addresses = addresses
	}
}

module.exports = MessageMyAddresses
