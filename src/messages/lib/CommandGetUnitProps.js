const AbstarctMessage = require('./AbstarctMessage')

class CommandGetUnitProps extends AbstarctMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'command_get_unit_props'
		this.unit = unit
	}
}

module.exports = CommandGetUnitProps
