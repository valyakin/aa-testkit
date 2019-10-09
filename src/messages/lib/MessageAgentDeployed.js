const AbstarctMessage = require('./AbstarctMessage')

class MessageAgentDeployed extends AbstarctMessage {
	constructor ({ unit, address }) {
		super()
		this.topic = 'agent_deployed'
		this.unit = unit
		this.address = address
	}
}

module.exports = MessageAgentDeployed
