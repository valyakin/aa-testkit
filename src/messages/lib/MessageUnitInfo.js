const AbstractMessage = require('./AbstractMessage')

class MessageUnitInfo extends AbstractMessage {
	constructor ({ unitObj, error }) {
		super()
		this.topic = 'unit_info'
		this.unitObj = unitObj
		this.error = error
	}
}

module.exports = MessageUnitInfo
