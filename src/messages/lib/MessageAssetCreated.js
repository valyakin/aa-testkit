const AbstractMessage = require('./AbstractMessage')

class MessageAssetCreated extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'asset_created'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageAssetCreated
