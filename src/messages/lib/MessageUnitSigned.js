const AbstractMessage = require('./AbstractMessage')

class MessageUnitSigned extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'signed_unit'
		this.unit = unit
		this.error = error
	}
}

module.exports = MessageUnitSigned
