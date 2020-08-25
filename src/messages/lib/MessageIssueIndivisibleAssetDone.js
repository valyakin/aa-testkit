const AbstractMessage = require('./AbstractMessage')

class MessageIssueIndivisibleAssetDone extends AbstractMessage {
	constructor ({ unit, error }) {
		super()
		this.topic = 'issue_indivisible_asset_done'
		this.error = error
		this.unit = unit
	}
}

module.exports = MessageIssueIndivisibleAssetDone
