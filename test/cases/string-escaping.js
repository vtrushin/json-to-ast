var ast = {
	type: 'object',
	properties: [
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'quota\\\"tion'
			},
			value: {
				type: 'string',
				value: 'reverse\\\\solidus'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'soli\\/dus'
			},
			value: {
				type: 'string',
				value: 'back\\bspace'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'form\\ffeed'
			},
			value: {
				type: 'string',
				value: 'new\\nline'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: 're\\rturn'
			},
			value: {
				type: 'string',
				value: 'tab\\tsymbol'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: 'hex\\u0001digit'
			},
			value: {
				type: 'string',
				value: ''
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: '\\\"\\\"\\\"\\\"'
			},
			value: {
				type: 'string',
				value: '\\\\\\\\\\\\'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: '\\/'
			},
			value: {
				type: 'string',
				value: '\\b'
			}
		},
		{
			type: 'property',
			key: {
				type: 'key',
				value: '\\\"\\/'
			},
			value: {
				type: 'string',
				value: '\\\"\\\\\\/\\b\\f\\n\\r\\t\\u0001'
			}
		}
	]
};

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
