const AbstarctMessage = require('./AbstarctMessage')

class MessageConnectedToHub extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'connected_to_hub'
	}
}

module.exports = MessageConnectedToHub
