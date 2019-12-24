const AbstractMessage = require('./AbstractMessage')

class MessageMciBecameStable extends AbstractMessage {
	constructor ({ mci }) {
		super()
		this.topic = 'mci_became_stable'
		this.mci = mci
	}
}

module.exports = MessageMciBecameStable
