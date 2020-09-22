const path = require('path')
const { Testkit } = require('../../main')

module.exports = Testkit({
	TESTDATA_DIR: path.join(process.cwd(), 'testdata'),
})
