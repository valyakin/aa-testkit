const MessageLastMCI = require('./lib/MessageLastMCI')
const MessageNewJoint = require('./lib/MessageNewJoint')
const MessageUnitInfo = require('./lib/MessageUnitInfo')
const MessageUnitProps = require('./lib/MessageUnitProps')
const MessageSentMulti = require('./lib/MessageSentMulti')
const MessageSentBytes = require('./lib/MessageSentBytes')
const MessageMyAddress = require('./lib/MessageMyAddress')
const MessageMyBalance = require('./lib/MessageMyBalance')
const MessageSavedUnit = require('./lib/MessageSavedUnit')
const MessageBalanceOf = require('./lib/MessageBalanceOf')
const MessageAAResponse = require('./lib/MessageAAResponse')
const MessageChildError = require('./lib/MessageChildError')
const MessageChildReady = require('./lib/MessageChildReady')
const MessageAaTriggered = require('./lib/MessageAaTriggered')
const MessageCurrentTime = require('./lib/MessageCurrentTime')
const MessageMyAddresses = require('./lib/MessageMyAddresses')
const MessageAAStateVars = require('./lib/MessageAAStateVars')
const MessageChildStarted = require('./lib/MessageChildStarted')
const MessageAssetCreated = require('./lib/MessageAssetCreated')
const MessageAgentDeployed = require('./lib/MessageAgentDeployed')
const MessageWitnessPosted = require('./lib/MessageWitnessPosted')
const MessageTimeTravelDone = require('./lib/MessageTimeTravelDone')
const MessageConnectedToHub = require('./lib/MessageConnectedToHub')
const MessageGenesisCreated = require('./lib/MessageGenesisCreated')
const MessageMciBecameStable = require('./lib/MessageMciBecameStable')
const MessagePasswordRequired = require('./lib/MessagePasswordRequired')
const MessageOutputsBalanceOf = require('./lib/MessageOutputsBalanceOf')

const CommandGetTime = require('./lib/CommandGetTime')
const CommandTriggerAa = require('./lib/CommandTriggerAa')
const CommandSendMulti = require('./lib/CommandSendMulti')
const CommandChildStop = require('./lib/CommandChildStop')
const CommandSendBytes = require('./lib/CommandSendBytes')
const CommandGetLastMCI = require('./lib/CommandGetLastMCI')
const CommandGetAddress = require('./lib/CommandGetAddress')
const CommandLoginToHub = require('./lib/CommandLoginToHub')
const CommandGetBalance = require('./lib/CommandGetBalance')
const CommandTimeTravel = require('./lib/CommandTimeTravel')
const CommandDeployAgent = require('./lib/CommandDeployAgent')
const CommandCreateAsset = require('./lib/CommandCreateAsset')
const CommandPostWitness = require('./lib/CommandPostWitness')
const CommandGetUnitInfo = require('./lib/CommandGetUnitInfo')
const CommandGetUnitProps = require('./lib/CommandGetUnitProps')
const CommandGetBalanceOf = require('./lib/CommandGetBalanceOf')
const CommandCreateGenesis = require('./lib/CommandCreateGenesis')
const CommandGetMyAddresses = require('./lib/CommandGetMyAddresses')
const CommandReadAAStateVars = require('./lib/CommandReadAAStateVars')
const CommandGetOutputsBalanceOf = require('./lib/CommandGetOutputsBalanceOf')

const fromMessage = (m) => {
	const message = JSON.parse(m)

	switch (message.topic) {
	case 'last_mci': return new MessageLastMCI(message)
	case 'new_joint': return new MessageNewJoint(message)
	case 'unit_info': return new MessageUnitInfo(message)
	case 'unit_props': return new MessageUnitProps(message)
	case 'sent_multi': return new MessageSentMulti(message)
	case 'sent_bytes': return new MessageSentBytes(message)
	case 'my_address': return new MessageMyAddress(message)
	case 'my_balance': return new MessageMyBalance(message)
	case 'balance_of': return new MessageBalanceOf(message)
	case 'saved_unit': return new MessageSavedUnit(message)
	case 'aa_response': return new MessageAAResponse(message)
	case 'child_error': return new MessageChildError(message)
	case 'child_ready': return new MessageChildReady(message)
	case 'aa_triggered': return new MessageAaTriggered(message)
	case 'current_time': return new MessageCurrentTime(message)
	case 'my_addresses': return new MessageMyAddresses(message)
	case 'aa_state_vars': return new MessageAAStateVars(message)
	case 'child_started': return new MessageChildStarted(message)
	case 'asset_created': return new MessageAssetCreated(message)
	case 'witness_posted': return new MessageWitnessPosted(message)
	case 'agent_deployed': return new MessageAgentDeployed(message)
	case 'genesis_created': return new MessageGenesisCreated(message)
	case 'time_travel_done': return new MessageTimeTravelDone(message)
	case 'connected_to_hub': return new MessageConnectedToHub(message)
	case 'mci_became_stable': return new MessageMciBecameStable(message)
	case 'password_required': return new MessagePasswordRequired(message)
	case 'outputs_balance_of': return new MessageOutputsBalanceOf(message)

	case 'command_get_time': return new CommandGetTime(message)
	case 'command_trigger_aa': return new CommandTriggerAa(message)
	case 'command_send_multi': return new CommandSendMulti(message)
	case 'command_child_stop': return new CommandChildStop(message)
	case 'command_send_bytes': return new CommandSendBytes(message)
	case 'command_get_address': return new CommandGetAddress(message)
	case 'command_get_balance': return new CommandGetBalance(message)
	case 'command_time_travel': return new CommandTimeTravel(message)
	case 'command_get_last_mci': return new CommandGetLastMCI(message)
	case 'command_login_to_hub': return new CommandLoginToHub(message)
	case 'command_deploy_agent': return new CommandDeployAgent(message)
	case 'command_create_asset': return new CommandCreateAsset(message)
	case 'command_post_witness': return new CommandPostWitness(message)
	case 'command_get_unit_info': return new CommandGetUnitInfo(message)
	case 'command_get_balance_of': return new CommandGetBalanceOf(message)
	case 'command_get_unit_props': return new CommandGetUnitProps(message)
	case 'command_create_genesis': return new CommandCreateGenesis(message)
	case 'command_get_my_addresses': return new CommandGetMyAddresses(message)
	case 'command_read_aa_state_vars': return new CommandReadAAStateVars(message)
	case 'command_get_outputs_balance_of': return new CommandGetOutputsBalanceOf(message)

	default: throw new Error(`Unsupported message topic '${message.topic}'`)
	}
}

module.exports = {
	fromMessage,

	MessageLastMCI,
	MessageNewJoint,
	MessageUnitInfo,
	MessageUnitProps,
	MessageSentMulti,
	MessageSentBytes,
	MessageMyAddress,
	MessageMyBalance,
	MessageBalanceOf,
	MessageSavedUnit,
	MessageChildError,
	MessageAAResponse,
	MessageChildReady,
	MessageAaTriggered,
	MessageCurrentTime,
	MessageMyAddresses,
	MessageAAStateVars,
	MessageChildStarted,
	MessageAssetCreated,
	MessageWitnessPosted,
	MessageAgentDeployed,
	MessageConnectedToHub,
	MessageTimeTravelDone,
	MessageGenesisCreated,
	MessageMciBecameStable,
	MessagePasswordRequired,
	MessageOutputsBalanceOf,

	CommandGetTime,
	CommandTriggerAa,
	CommandSendMulti,
	CommandChildStop,
	CommandSendBytes,
	CommandGetLastMCI,
	CommandGetAddress,
	CommandLoginToHub,
	CommandTimeTravel,
	CommandGetBalance,
	CommandDeployAgent,
	CommandCreateAsset,
	CommandPostWitness,
	CommandGetUnitInfo,
	CommandGetUnitProps,
	CommandGetBalanceOf,
	CommandCreateGenesis,
	CommandGetMyAddresses,
	CommandReadAAStateVars,
	CommandGetOutputsBalanceOf,
}
