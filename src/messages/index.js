const MessageSentBytes = require('./lib/MessageSentBytes')
const MessageMyAddress = require('./lib/MessageMyAddress')
const MessageMyBalance = require('./lib/MessageMyBalance')
const MessageChildError = require('./lib/MessageChildError')
const MessageChildReady = require('./lib/MessageChildReady')
const MessageChildStarted = require('./lib/MessageChildStarted')
const MessageConnectedToHub = require('./lib/MessageConnectedToHub')
const MessageGenesisCreated = require('./lib/MessageGenesisCreated')
const MessageMciBecameStable = require('./lib/MessageMciBecameStable')
const MessagePasswordRequired = require('./lib/MessagePasswordRequired')

const CommandChildStop = require('./lib/CommandChildStop')
const CommandSendBytes = require('./lib/CommandSendBytes')
const CommandGetAddress = require('./lib/CommandGetAddress')
const CommandLoginToHub = require('./lib/CommandLoginToHub')
const CommandGetBalance = require('./lib/CommandGetBalance')
const CommandPostWitness = require('./lib/CommandPostWitness')

const fromMessage = (m) => {
	const message = JSON.parse(m)

	switch (message.topic) {
	case 'sent_bytes': return new MessageSentBytes(message)
	case 'my_address': return new MessageMyAddress(message)
	case 'my_balance': return new MessageMyBalance(message)
	case 'child_error': return new MessageChildError(message)
	case 'child_ready': return new MessageChildReady(message)
	case 'child_started': return new MessageChildStarted(message)
	case 'genesis_created': return new MessageGenesisCreated(message)
	case 'connected_to_hub': return new MessageConnectedToHub(message)
	case 'mci_became_stable': return new MessageMciBecameStable(message)
	case 'password_required': return new MessagePasswordRequired(message)

	case 'command_child_stop': return new CommandChildStop(message)
	case 'command_send_bytes': return new CommandSendBytes(message)
	case 'command_get_address': return new CommandGetAddress(message)
	case 'command_get_balance': return new CommandGetBalance(message)
	case 'command_login_to_hub': return new CommandLoginToHub(message)
	case 'command_post_witness': return new CommandPostWitness(message)

	default: throw new Error(`Unsupported message topic '${message.topic}'`)
	}
}

module.exports = {
	fromMessage,

	MessageSentBytes,
	MessageMyAddress,
	MessageMyBalance,
	MessageChildError,
	MessageChildReady,
	MessageChildStarted,
	MessageConnectedToHub,
	MessageGenesisCreated,
	MessageMciBecameStable,
	MessagePasswordRequired,

	CommandChildStop,
	CommandSendBytes,
	CommandGetAddress,
	CommandLoginToHub,
	CommandGetBalance,
	CommandPostWitness,
}
