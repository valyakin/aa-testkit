const AbstarctMessage = require('./AbstarctMessage')

class MessageGenesisCreated extends AbstarctMessage {
	constructor ({ address, genesisUnit }) {
		super()
		this.address = address
		this.genesisUnit = genesisUnit
		this.topic = 'genesis_created'
	}
}

module.exports = MessageGenesisCreated
