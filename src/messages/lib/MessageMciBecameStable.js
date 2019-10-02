const AbstarctMessage = require('./AbstarctMessage')

class MessageMciBecameStable extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'mci_became_stable'
	}
}

module.exports = MessageMciBecameStable
