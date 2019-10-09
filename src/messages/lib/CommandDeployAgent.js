const AbstarctMessage = require('./AbstarctMessage')

class CommandDeployAgent extends AbstarctMessage {
	constructor ({ agent }) {
		super()
		this.topic = 'command_deploy_agent'
		this.agent = agent
	}
}

module.exports = CommandDeployAgent
