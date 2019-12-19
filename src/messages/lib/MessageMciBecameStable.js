const AbstarctMessage = require('./AbstarctMessage')

class MessageMciBecameStable extends AbstarctMessage {
	constructor ({ mci }) {
		super()
		this.topic = 'mci_became_stable'
		this.mci = mci
	}
}

module.exports = MessageMciBecameStable
