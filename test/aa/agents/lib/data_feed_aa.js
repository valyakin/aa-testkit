module.exports = `{
	bounce_fees: { base: 10000 },
	messages: [
		{
			init: '{
				$datafeed = trigger.data.dataFeedPayload;
				response['dataFeedAaResponse'] = 'aa response!';
			}',
			app: 'data_feed',
			payload: {
				dataFeedPayload: '{
					if ($datafeed)
						return $datafeed;
					'no datafeed provided'
				}'
			}
		}
	]
}`
