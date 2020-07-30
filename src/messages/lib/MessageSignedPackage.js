const AbstractMessage = require('./AbstractMessage')

class MessageSignedPackage extends AbstractMessage {
	constructor ({ error, signedPackage }) {
		super()
		this.topic = 'signed_package'
		this.signedPackage = signedPackage
		this.error = error
	}
}

module.exports = MessageSignedPackage
