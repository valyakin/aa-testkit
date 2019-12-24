const AbstractMessage = require('./AbstractMessage')

class MessageGenesisCreated extends AbstractMessage {
	constructor ({ address, genesisUnit }) {
		super()
		this.address = address
		this.genesisUnit = genesisUnit
		this.topic = 'genesis_created'
	}
}

module.exports = MessageGenesisCreated
