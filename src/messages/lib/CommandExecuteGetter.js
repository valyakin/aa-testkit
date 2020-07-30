const AbstractMessage = require('./AbstractMessage')

class CommandExecuteGetter extends AbstractMessage {
	constructor ({ aaAddress, getter, args }) {
		super()
		this.topic = 'command_execute_getter'
		this.aaAddress = aaAddress
		this.getter = getter
		this.args = args
	}
}

module.exports = CommandExecuteGetter
