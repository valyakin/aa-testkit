const AbstractMessage = require('./AbstractMessage')

class MessageAgentDeployed extends AbstractMessage {
	constructor ({ unit, address, error }) {
		super()
		this.topic = 'agent_deployed'
		this.address = address
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageAgentDeployed
