const fs = require('fs')

const prefixes = {}

const getIdForPrefix = (dir, prefix) => {
	const path = `${dir}/${prefix}`
	let maxId = 0
	if (prefixes[path]) {
		maxId = prefixes[path]
	} else {
		const names = fs.readdirSync(dir)
		names.forEach(name => {
			const match = name.match(new RegExp(`${prefix}(\\d+)`))
			if (match) {
				maxId = Math.max(maxId, Number(match[1]))
			}
		})
	}

	const newId = maxId + 1
	prefixes[path] = newId

	return `${prefix}` + String(newId).padStart(4, '0')
}

module.exports = getIdForPrefix
