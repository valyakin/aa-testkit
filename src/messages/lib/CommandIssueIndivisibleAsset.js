const AbstractMessage = require('./AbstractMessage')

class CommandIssueIndivisibleAsset extends AbstractMessage {
	constructor ({ opts }) {
		super()
		this.topic = 'command_issue_indivisible_asset'
		this.opts = opts
	}
}

module.exports = CommandIssueIndivisibleAsset
