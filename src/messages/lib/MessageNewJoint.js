const AbstarctMessage = require('./AbstarctMessage')

class MessageNewJoint extends AbstarctMessage {
	constructor ({ joint }) {
		super()
		this.topic = 'new_joint'
		this.joint = joint
	}
}

module.exports = MessageNewJoint
