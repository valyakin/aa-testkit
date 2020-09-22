const AbstractMessage = require('./AbstractMessage')

class MessageCustom extends AbstractMessage {
	constructor ({ payload }) {
		super()
		this.topic = 'custom'
		this.payload = payload
	}
}

module.exports = MessageCustom
