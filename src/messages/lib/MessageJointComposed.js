const AbstractMessage = require('./AbstractMessage')

class MessageJointComposed extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'joint_composed'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageJointComposed
