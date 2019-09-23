const AbstarctMessage = require('./AbstarctMessage')

class MessageMyAddress extends AbstarctMessage {
	constructor ({ address }) {
		super()
		this.topic = 'my_address'
		this.address = address
	}
}

module.exports = MessageMyAddress
