const path = require('path')

// add `requireRoot` function to allow modules in tests to be resolved relative to project root
function requireRoot (resource) {
	return require(path.join(`${__dirname}`, '../', `${resource}`))
};
global.requireRoot = requireRoot

// avoid importing `expect` in every test
const chai = require('chai')
const expect = chai.expect
global.expect = expect
