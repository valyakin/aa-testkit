const AbstractMessage = require('./AbstractMessage')

class CommandGetUnitProps extends AbstractMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'command_get_unit_props'
		this.unit = unit
	}
}

module.exports = CommandGetUnitProps
