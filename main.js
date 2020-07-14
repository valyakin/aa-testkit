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
	return {
		Nodes,
		Network,
		Utils,
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
