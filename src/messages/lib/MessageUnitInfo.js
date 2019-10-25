const AbstarctMessage = require('./AbstarctMessage')

class MessageUnitInfo extends AbstarctMessage {
	constructor ({ unitObj }) {
		super()
		this.topic = 'unit_info'
		this.unitObj = unitObj
	}
}

module.exports = MessageUnitInfo
