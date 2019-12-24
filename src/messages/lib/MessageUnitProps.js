const AbstractMessage = require('./AbstractMessage')

class MessageUnitProps extends AbstractMessage {
	constructor ({ unitProps }) {
		super()
		this.topic = 'unit_props'
		this.unitProps = unitProps
	}
}

module.exports = MessageUnitProps
