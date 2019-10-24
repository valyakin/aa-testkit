// this AA will set state var to different value after year 2030

module.exports = `{
	bounce_fees: { base: 10000 },
	init: '{
		$future_ts = 1893456000; // Jan 1, 2030
	}',
	messages: {
		cases: [
			{
				if: '{timestamp > $future_ts}',
				messages: [
					{
						app: 'state',
						state: '{
							var['time'] = 'future';
						}'
					},
				]
			},
			{
				if: '{timestamp <= $future_ts}',
				messages: [
					{
						app: 'state',
						state: '{
							var['time'] = 'past';
						}'
					},
				]
			}
		]
	}
}`
