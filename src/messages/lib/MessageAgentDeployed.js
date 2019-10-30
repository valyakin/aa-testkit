const AbstarctMessage = require('./AbstarctMessage')

class MessageAgentDeployed extends AbstarctMessage {
	constructor ({ unit, address, error }) {
		super()
		this.topic = 'agent_deployed'
		this.address = address
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageAgentDeployed
