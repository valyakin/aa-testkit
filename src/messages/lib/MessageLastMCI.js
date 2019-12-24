const AbstractMessage = require('./AbstractMessage')

class MessageLastMCI extends AbstractMessage {
	constructor ({ mci }) {
		super()
		this.topic = 'last_mci'
		this.mci = mci
	}
}

module.exports = MessageLastMCI
