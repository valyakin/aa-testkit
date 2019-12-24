const AbstractMessage = require('./AbstractMessage')

class CommandCreateAsset extends AbstractMessage {
	constructor ({ assetDefinition }) {
		super()
		this.topic = 'command_create_asset'
		this.assetDefinition = assetDefinition
	}
}

module.exports = CommandCreateAsset
