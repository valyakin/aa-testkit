function sleep (ms) {
	console.log('sleep')
	return new Promise(resolve => {
		setTimeout(() => resolve(), ms)
	})
}

module.exports = sleep
