const AbstarctMessage = require('./AbstarctMessage')

class MessagePasswordRequired extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'password_required'
	}
}

module.exports = MessagePasswordRequired
