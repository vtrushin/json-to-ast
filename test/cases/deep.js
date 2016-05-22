function string(value) {
	return {
		type: 'string',
		value: value
	}
}

function object(key, value) {
	if (typeof value === 'string') {
		value = string(value);
	}

	return {
		type: 'object',
		properties: [
			{
				type: 'property',
				key: {
					type: 'key',
					value: key
				},
				value: value
			}
		]
	}
}

function array() {
	return {
		type: 'array',
		items: Array.prototype.slice.call(arguments).map(function(item) {
			if (typeof item === 'string') {
				item = string(item);
			}

			return item;
		})
	}
}

var ast =
	object('a',
		object('b',
			object('c',
				object('d',
					object('e',
						object('f',
							object('g',
								array('h',
									array('i',
										array('j',
											array('k',
												array('l',
													array('m',
														array('n')
													)
												)
											)
										)
									)
								)
							)
						)
					)
				)
			)
		)
	);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};

