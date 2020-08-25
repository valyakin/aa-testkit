const AbstractMessage = require('./AbstractMessage')

class CommandIssueDivisibleAsset extends AbstractMessage {
	constructor ({ opts }) {
		super()
		this.topic = 'command_issue_divisible_asset'
		this.opts = opts
	}
}

module.exports = CommandIssueDivisibleAsset
