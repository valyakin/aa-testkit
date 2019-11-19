const AbstarctMessage = require('./AbstarctMessage')

class MessageAAResponse extends AbstarctMessage {
	constructor ({ response }) {
		super()
		this.topic = 'aa_response'
		this.response = response
	}
}

module.exports = MessageAAResponse
