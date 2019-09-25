const MessageMyAddress = require('./lib/MessageMyAddress')
const MessageChildError = require('./lib/MessageChildError')
const MessageChildReady = require('./lib/MessageChildReady')
const MessageChildStarted = require('./lib/MessageChildStarted')
const MessageGenesisCreated = require('./lib/MessageGenesisCreated')
const MessagePasswordRequired = require('./lib/MessagePasswordRequired')

const CommandSendBytes = require('./lib/CommandSendBytes')
const CommandGetAddress = require('./lib/CommandGetAddress')
const CommandLoginToHub = require('./lib/CommandLoginToHub')
const CommandPostWitness = require('./lib/CommandPostWitness')

const fromMessage = (m) => {
	const message = JSON.parse(m)

	switch (message.topic) {
	case 'my_address': return new MessageMyAddress(message)
	case 'child_error': return new MessageChildError(message)
	case 'child_ready': return new MessageChildReady(message)
	case 'child_started': return new MessageChildStarted(message)
	case 'genesis_created': return new MessageGenesisCreated(message)
	case 'password_required': return new MessagePasswordRequired(message)

	case 'command_send_bytes': return new CommandSendBytes(message)
	case 'command_get_address': return new CommandGetAddress(message)
	case 'command_login_to_hub': return new CommandLoginToHub(message)
	case 'command_post_witness': return new CommandPostWitness(message)

	default: throw new Error(`Unsupported message topic '${message.topic}'`)
	}
}

module.exports = {
	fromMessage,

	MessageMyAddress,
	MessageChildError,
	MessageChildReady,
	MessageChildStarted,
	MessageGenesisCreated,
	MessagePasswordRequired,

	CommandSendBytes,
	CommandGetAddress,
	CommandLoginToHub,
	CommandPostWitness,
}
