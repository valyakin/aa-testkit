const MessageUnitInfo = require('./lib/MessageUnitInfo')
const MessageSentData = require('./lib/MessageSentData')
const MessageSentMulti = require('./lib/MessageSentMulti')
const MessageSentBytes = require('./lib/MessageSentBytes')
const MessageMyAddress = require('./lib/MessageMyAddress')
const MessageMyBalance = require('./lib/MessageMyBalance')
const MessageChildError = require('./lib/MessageChildError')
const MessageChildReady = require('./lib/MessageChildReady')
const MessageAAStateVars = require('./lib/MessageAAStateVars')
const MessageChildStarted = require('./lib/MessageChildStarted')
const MessageAgentDeployed = require('./lib/MessageAgentDeployed')
const MessageTimeTravelDone = require('./lib/MessageTimeTravelDone')
const MessageConnectedToHub = require('./lib/MessageConnectedToHub')
const MessageGenesisCreated = require('./lib/MessageGenesisCreated')
const MessageMciBecameStable = require('./lib/MessageMciBecameStable')
const MessagePasswordRequired = require('./lib/MessagePasswordRequired')

const CommandSendData = require('./lib/CommandSendData')
const CommandSendMulti = require('./lib/CommandSendMulti')
const CommandChildStop = require('./lib/CommandChildStop')
const CommandSendBytes = require('./lib/CommandSendBytes')
const CommandGetAddress = require('./lib/CommandGetAddress')
const CommandLoginToHub = require('./lib/CommandLoginToHub')
const CommandGetBalance = require('./lib/CommandGetBalance')
const CommandTimeTravel = require('./lib/CommandTimeTravel')
const CommandDeployAgent = require('./lib/CommandDeployAgent')
const CommandPostWitness = require('./lib/CommandPostWitness')
const CommandGetUnitInfo = require('./lib/CommandGetUnitInfo')
const CommandReadAAStateVars = require('./lib/CommandReadAAStateVars')

const fromMessage = (m) => {
	const message = JSON.parse(m)

	switch (message.topic) {
	case 'unit_info': return new MessageUnitInfo(message)
	case 'sent_data': return new MessageSentData(message)
	case 'sent_multi': return new MessageSentMulti(message)
	case 'sent_bytes': return new MessageSentBytes(message)
	case 'my_address': return new MessageMyAddress(message)
	case 'my_balance': return new MessageMyBalance(message)
	case 'child_error': return new MessageChildError(message)
	case 'child_ready': return new MessageChildReady(message)
	case 'aa_state_vars': return new MessageAAStateVars(message)
	case 'child_started': return new MessageChildStarted(message)
	case 'agent_deployed': return new MessageAgentDeployed(message)
	case 'genesis_created': return new MessageGenesisCreated(message)
	case 'time_travel_done': return new MessageTimeTravelDone(message)
	case 'connected_to_hub': return new MessageConnectedToHub(message)
	case 'mci_became_stable': return new MessageMciBecameStable(message)
	case 'password_required': return new MessagePasswordRequired(message)

	case 'command_send_data': return new CommandSendData(message)
	case 'command_send_multi': return new CommandSendMulti(message)
	case 'command_child_stop': return new CommandChildStop(message)
	case 'command_send_bytes': return new CommandSendBytes(message)
	case 'command_get_address': return new CommandGetAddress(message)
	case 'command_get_balance': return new CommandGetBalance(message)
	case 'command_time_travel': return new CommandTimeTravel(message)
	case 'command_login_to_hub': return new CommandLoginToHub(message)
	case 'command_deploy_agent': return new CommandDeployAgent(message)
	case 'command_post_witness': return new CommandPostWitness(message)
	case 'command_get_unit_info': return new CommandGetUnitInfo(message)
	case 'command_read_aa_state_vars': return new CommandReadAAStateVars(message)

	default: throw new Error(`Unsupported message topic '${message.topic}'`)
	}
}

module.exports = {
	fromMessage,

	MessageUnitInfo,
	MessageSentData,
	MessageSentMulti,
	MessageSentBytes,
	MessageMyAddress,
	MessageMyBalance,
	MessageChildError,
	MessageChildReady,
	MessageAAStateVars,
	MessageChildStarted,
	MessageAgentDeployed,
	MessageConnectedToHub,
	MessageTimeTravelDone,
	MessageGenesisCreated,
	MessageMciBecameStable,
	MessagePasswordRequired,

	CommandSendData,
	CommandSendMulti,
	CommandChildStop,
	CommandSendBytes,
	CommandGetAddress,
	CommandLoginToHub,
	CommandTimeTravel,
	CommandGetBalance,
	CommandDeployAgent,
	CommandPostWitness,
	CommandGetUnitInfo,
	CommandReadAAStateVars,
}
