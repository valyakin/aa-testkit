const uniqid = require('uniqid')
const path = require('path')
const args = require('yargs').argv

const runId = args.run ? args.run : uniqid('run-')
const testHome = path.join(__dirname, `../testdata/${runId}`)
console.log('TEST_RUN_HOME', testHome)

module.exports = {
	TEST_RUN_HOME: testHome,
	DEFAULT_PASSPHRASE: '0000',
	GENESIS_UNIT: 'sVMyHMe4Ab9bUkuyB3s0JzHvKiP/J9mQgqXM/2uWNAA=',
}
