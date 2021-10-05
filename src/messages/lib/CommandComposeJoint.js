const AbstractMessage = require('./AbstractMessage')

class CommandComposeJoint extends AbstractMessage {
	constructor ({ opts, saveJoint, broadcastJoint }) {
		super()
		this.topic = 'command_compose_joint'
		this.opts = opts
		this.saveJoint = saveJoint
		this.broadcastJoint = broadcastJoint
	}
}

module.exports = CommandComposeJoint
