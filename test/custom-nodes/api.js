// eslint-disable-next-line no-unused-vars
const headless = require('headless-obyte')
const db = require('ocore/db.js')
const objectHash = require('ocore/object_hash')

class API {
	getChash (data) {
		const chash = objectHash.getChash160(data)
		return chash
	}

	getMyWitnesses () {
		return new Promise(resolve => {
			db.query('SELECT address FROM my_witnesses', (rows) => {
				resolve(rows.map(r => r.address))
			})
		})
	}
}

module.exports = API
