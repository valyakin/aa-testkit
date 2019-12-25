const fs = require('fs')
const path = require('path')
const lock = require('./lock')
const unlock = require('./unlock')
const getIdForPrefix = require('./getIdForPrefix')

const createRundir = async (testdatadir) => {
	await lock(path.join(testdatadir, 'create_rundir.lock'))
	const runid = getIdForPrefix(testdatadir, 'runid-')
	const rundir = path.join(testdatadir, runid)
	fs.mkdirSync(rundir)
	await unlock(path.join(testdatadir, 'create_rundir.lock'))
	return rundir
}
module.exports = createRundir
