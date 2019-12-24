const AbstractMessage = require('./AbstractMessage')

class CommandDeployAgent extends AbstractMessage {
	constructor ({ ojson }) {
		super()
		this.topic = 'command_deploy_agent'
		this.ojson = ojson
	}
}

module.exports = CommandDeployAgent
