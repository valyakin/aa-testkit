const AbstractMessage = require('./AbstractMessage')

class MessagePasswordRequired extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'password_required'
	}
}

module.exports = MessagePasswordRequired
