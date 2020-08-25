const AbstractMessage = require('./AbstractMessage')

class MessageIssueDivisibleAssetDone extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'issue_divisible_asset_done'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageIssueDivisibleAssetDone
