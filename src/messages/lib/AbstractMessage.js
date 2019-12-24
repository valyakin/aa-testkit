class AbstractMessage {
	serialize () {
		return JSON.stringify(this)
	}
}

module.exports = AbstractMessage
