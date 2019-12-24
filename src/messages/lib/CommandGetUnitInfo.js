const AbstractMessage = require('./AbstractMessage')

class CommandGetUnitInfo extends AbstractMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'command_get_unit_info'
		this.unit = unit
	}
}

module.exports = CommandGetUnitInfo
