const AbstractMessage = require('./AbstractMessage')

class MessageSavedUnit extends AbstractMessage {
	constructor ({ joint }) {
		super()
		this.topic = 'saved_unit'
		this.joint = joint
	}
}

module.exports = MessageSavedUnit
