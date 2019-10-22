function sleep (ms) {
	console.log('sleep', ms)
	return new Promise(resolve => {
		setTimeout(() => resolve(), ms)
	})
}

module.exports = sleep
