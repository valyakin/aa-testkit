const AbstractMessage = require('./AbstractMessage')

class MessageMyAddress extends AbstractMessage {
	constructor ({ address }) {
		super()
		this.topic = 'my_address'
		this.address = address
	}
}

module.exports = MessageMyAddress
