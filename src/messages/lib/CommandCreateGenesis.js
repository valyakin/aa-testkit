const AbstractMessage = require('./AbstractMessage')

class CommandCreateGenesis extends AbstractMessage {
	constructor ({ witnesses, transfers }) {
		super()
		this.topic = 'command_create_genesis'
		this.witnesses = witnesses
		this.transfers = transfers
	}
}

module.exports = CommandCreateGenesis
