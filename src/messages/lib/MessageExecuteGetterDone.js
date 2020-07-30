const AbstractMessage = require('./AbstractMessage')

class MessageExecuteGetterDone extends AbstractMessage {
	constructor ({ result, error }) {
		super()
		this.topic = 'execute_getter_done'
		this.result = result
		this.error = error
	}
}

module.exports = MessageExecuteGetterDone
