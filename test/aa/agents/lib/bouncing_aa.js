module.exports = `{
	bounce_fees: { base: 10000 },
	messages: [
		{
			init: '{
				bounce('Bounce with message ' || trigger.data.bounceMessage);
			}',
			app: 'data_feed',
			payload: {
				bounceMessage: 'Data feed will not be posted'
			}
		}
	]
}`
