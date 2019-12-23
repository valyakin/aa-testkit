const AbstarctMessage = require('./AbstarctMessage')

class CommandCreateAsset extends AbstarctMessage {
	constructor ({ assetDefinition }) {
		super()
		this.topic = 'command_create_asset'
		this.assetDefinition = assetDefinition
	}
}

module.exports = CommandCreateAsset
