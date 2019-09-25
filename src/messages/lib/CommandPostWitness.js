const AbstarctMessage = require('./AbstarctMessage')

class CommandPostWitness extends AbstarctMessage {
	constructor () {
		super()
		this.topic = 'command_post_witness'
	}
}

module.exports = CommandPostWitness
