function requireRoot (resource) {
	return require(`${__dirname}/${resource}`)
};

module.exports =
global.requireRoot = requireRoot
