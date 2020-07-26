const AbstractMessage = require('./AbstractMessage')

class MessageSignedPackage extends AbstractMessage {
	constructor ({ signedPackage }) {
		super()
		this.topic = 'signed_package'
		this.signedPackage = signedPackage
	}
}

module.exports = MessageSignedPackage
