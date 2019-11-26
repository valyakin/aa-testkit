const AbstarctMessage = require('./AbstarctMessage')

class MessageUnitProps extends AbstarctMessage {
	constructor ({ unitProps }) {
		super()
		this.topic = 'unit_props'
		this.unitProps = unitProps
	}
}

module.exports = MessageUnitProps
