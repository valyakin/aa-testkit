const AbstractMessage = require('./AbstractMessage')

class MessageWitnessPosted extends AbstractMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'witness_posted'
		this.unit = unit
	}
}

module.exports = MessageWitnessPosted
