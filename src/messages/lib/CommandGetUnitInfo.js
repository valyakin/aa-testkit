const AbstarctMessage = require('./AbstarctMessage')

class CommandGetUnitInfo extends AbstarctMessage {
	constructor ({ unit }) {
		super()
		this.topic = 'command_get_unit_info'
		this.unit = unit
	}
}

module.exports = CommandGetUnitInfo
