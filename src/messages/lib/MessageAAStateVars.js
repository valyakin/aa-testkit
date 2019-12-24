const AbstractMessage = require('./AbstractMessage')

class MessageAAStateVars extends AbstractMessage {
	constructor ({ vars }) {
		super()
		this.topic = 'aa_state_vars'
		this.vars = vars
	}
}

module.exports = MessageAAStateVars
