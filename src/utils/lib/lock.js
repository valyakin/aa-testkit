const lockfile = require('lockfile')

function lock (lock, opts = { wait: 1e9 }) {
	return new Promise((resolve, reject) => {
		lockfile.lock(lock, opts, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		})
	})
}

module.exports = lock
