const AbstractMessage = require('./AbstractMessage')

class CommandSendMulti extends AbstractMessage {
	constructor ({ opts }) {
		super()
		this.topic = 'command_send_multi'
		this.opts = opts
	}
}

module.exports = CommandSendMulti
