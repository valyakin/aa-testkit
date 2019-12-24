const AbstarctMessage = require('./AbstarctMessage')

class MessageAssetCreated extends AbstarctMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'asset_created'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageAssetCreated
