const AbstarctMessage = require('./AbstarctMessage')

class CommandReadAAStateVars extends AbstarctMessage {
	constructor ({ address }) {
		super()
		this.topic = 'command_read_aa_state_vars'
		this.address = address
	}
}

module.exports = CommandReadAAStateVars
