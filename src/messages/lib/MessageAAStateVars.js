const AbstarctMessage = require('./AbstarctMessage')

class MessageAAStateVars extends AbstarctMessage {
	constructor ({ vars }) {
		super()
		this.topic = 'aa_state_vars'
		this.vars = vars
	}
}

module.exports = MessageAAStateVars
