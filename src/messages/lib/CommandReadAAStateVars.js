const AbstractMessage = require('./AbstractMessage')

class CommandReadAAStateVars extends AbstractMessage {
	constructor ({ address }) {
		super()
		this.topic = 'command_read_aa_state_vars'
		this.address = address
	}
}

module.exports = CommandReadAAStateVars
