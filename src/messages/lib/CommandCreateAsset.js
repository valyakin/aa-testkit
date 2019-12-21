const AbstarctMessage = require('./AbstarctMessage')

class CommandCreateAgent extends AbstarctMessage {
	constructor ({ asset_definition }) {
		super()
		this.topic = 'command_create_asset'
		this.asset_definition = asset_definition
	}
}

module.exports = CommandCreateAgent
