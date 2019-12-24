const AbstractMessage = require('./AbstractMessage')

class MessageAAResponse extends AbstractMessage {
	constructor ({ response }) {
		super()
		this.topic = 'aa_response'
		this.response = response
	}
}

module.exports = MessageAAResponse
