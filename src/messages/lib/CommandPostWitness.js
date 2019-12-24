const AbstractMessage = require('./AbstractMessage')

class CommandPostWitness extends AbstractMessage {
	constructor () {
		super()
		this.topic = 'command_post_witness'
	}
}

module.exports = CommandPostWitness
