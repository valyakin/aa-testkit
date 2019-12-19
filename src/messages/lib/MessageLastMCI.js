const AbstarctMessage = require('./AbstarctMessage')

class MessageLastMCI extends AbstarctMessage {
	constructor ({ mci }) {
		super()
		this.topic = 'last_mci'
		this.mci = mci
	}
}

module.exports = MessageLastMCI
