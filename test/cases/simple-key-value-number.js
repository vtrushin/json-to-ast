var ast = {
	properties: [
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'a'
			},
			value: {
				type: 'number',
				value: '1'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'b'
			},
			value: {
				type: 'number',
				value: '1.2'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'c'
			},
			value: {
				type: 'number',
				value: '1.2e3'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'd'
			},
			value: {
				type: 'number',
				value: '1.2e-3'
			}
		}
	],
	type: 'object'
};

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
