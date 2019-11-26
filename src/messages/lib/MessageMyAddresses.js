const AbstarctMessage = require('./AbstarctMessage')

class MessageMyAddresses extends AbstarctMessage {
	constructor ({ addresses }) {
		super()
		this.topic = 'my_addresses'
		this.addresses = addresses
	}
}

module.exports = MessageMyAddresses
