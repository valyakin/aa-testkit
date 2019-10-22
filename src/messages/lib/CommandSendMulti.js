const AbstarctMessage = require('./AbstarctMessage')

class CommandSendMulti extends AbstarctMessage {
	constructor (opts) {
		super()
		this.topic = 'command_send_multi'
		this.opts = opts
	}
}

module.exports = CommandSendMulti
