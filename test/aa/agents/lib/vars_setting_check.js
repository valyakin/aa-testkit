module.exports = `{
	bounce_fees: { base: 10000 },
	messages: [
		{
			app: 'state',
			state: "{
				var['constant_var'] = 'constant_var';
				var['trigger_var'] = trigger.data.var;
				var['sum_var'] = 123 + 456;
			}"
		}
	]
}`
