const portfinder = require('portfinder')

const getNetworkPort = (basePort) => {
	portfinder.basePort = basePort
	return portfinder.getPortPromise()
}

module.exports = getNetworkPort
