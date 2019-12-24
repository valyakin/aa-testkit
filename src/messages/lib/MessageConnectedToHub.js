const AbstractMessage = require('./AbstractMessage')

class MessageConnectedToHub extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'connected_to_hub'
	}
}

module.exports = MessageConnectedToHub
