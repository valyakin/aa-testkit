const AbstractMessage = require('./AbstractMessage')

class MessageChildReady extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'child_ready'
	}
}

module.exports = MessageChildReady
