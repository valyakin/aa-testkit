const Utils = require('./src/utils')
const { ChildrenManager } = require('./src/sevices')

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'
const config = require('config')

function Testkit (configs = {}) {
	const testkitDefaultConfigs = require('./config/default')['aa-testkit']
	config.util.extendDeep(testkitDefaultConfigs, configs)
	config.util.setModuleDefaults('aa-testkit', testkitDefaultConfigs)

	const Nodes = require('./src/nodes')
	const Network = require('./src/networks')
	const Custom = {
		Node: require('./src/nodes/CustomNode/CustomNode'),
		Child: require('./src/nodes/CustomNode/child/CustomNodeChild'),
	}

	return {
		Nodes,
		Network,
		Utils,
		Custom,
	}
}

process.on('exit', () => {
	ChildrenManager.stop()
})
process.on('SIGINT', () => {
	process.exit()
})
process.on('SIGTERM', () => {
	process.exit()
})

module.exports = { Testkit, Utils }
