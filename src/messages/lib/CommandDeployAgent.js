const AbstarctMessage = require('./AbstarctMessage')

class CommandDeployAgent extends AbstarctMessage {
	constructor ({ ojson }) {
		super()
		this.topic = 'command_deploy_agent'
		this.ojson = ojson
	}
}

module.exports = CommandDeployAgent
