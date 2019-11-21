const countCommissionInUnits = async (node, units) => {
	const infos = await Promise.all(units.map(unit => node.getUnitInfo({ unit })))
	const errorInfo = infos.find(i => i.error)
	if (errorInfo) {
		return {
			error: errorInfo.error,
			total_headers_commission: null,
			total_payload_commission: null,
		}
	} else {
		return {
			error: null,
			total_headers_commission: infos.reduce((acc, cur) => {
				return acc + cur.unitObj.unit.headers_commission
			}, 0),
			total_payload_commission: infos.reduce((acc, cur) => {
				return acc + cur.unitObj.unit.payload_commission
			}, 0),
		}
	}
}
module.exports = countCommissionInUnits
