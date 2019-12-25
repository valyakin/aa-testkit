const lockfile = require('lockfile')

function unlock (lock) {
	return new Promise((resolve, reject) => {
		lockfile.unlock(lock, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		})
	})
}

module.exports = unlock
