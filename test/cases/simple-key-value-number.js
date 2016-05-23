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
