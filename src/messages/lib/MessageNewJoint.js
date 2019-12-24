const AbstractMessage = require('./AbstractMessage')

class MessageNewJoint extends AbstractMessage {
	constructor ({ joint }) {
		super()
		this.topic = 'new_joint'
		this.joint = joint
	}
}

module.exports = MessageNewJoint
