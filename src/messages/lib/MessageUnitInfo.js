const AbstarctMessage = require('./AbstarctMessage')

class MessageUnitInfo extends AbstarctMessage {
	constructor ({ unitObj, error }) {
		super()
		this.topic = 'unit_info'
		this.unitObj = unitObj
		this.error = error
	}
}

module.exports = MessageUnitInfo
