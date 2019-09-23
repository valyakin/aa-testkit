const fs = require('fs')

function getIdForPrefix (dir, prefix) {
	const names = fs.readdirSync(dir)

	let maxId = 0
	names.forEach(name => {
		const match = name.match(new RegExp(`${prefix}(\\d+)`))
		if (match) {
			maxId = Math.max(maxId, Number(match[1]))
		}
	})

	return `${prefix}` + String(maxId + 1).padStart(4, '0')
}

module.exports = getIdForPrefix
