const childProcess = require('child_process')

class ChildrenManager {
	constructor () {
		this.children = []
	}

	fork (file, argv, options) {
		const child = childProcess.fork(file, argv, options)
		this.children.push(child)
		return child
	}

	stop () {
		this.children.forEach(c => c.kill('SIGINT'))
	}
}

module.exports = new ChildrenManager()
