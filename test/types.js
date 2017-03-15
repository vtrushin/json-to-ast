function location(startLine, startColumn, startOffset, endLine, endColumn, endOffset, fileName) {
	return {
		start: {
			line: startLine,
			column: startColumn,
			offset: startOffset
		},
		end: {
			line: endLine,
			column: endColumn,
			offset: endOffset
		},
		fileName: fileName || null
	}
}

function createObjectKey(value, location) {
	var node = {
		type: 'key',
		value: value
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createObjectProperty(key, value, location) {
	var node = {
		type: 'property',
		children: [
			key, value
		]
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createObject(properties, location) {
	var node = {
		type: 'object',
		children: properties
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createArray(items, location) {
	var node = {
		type: 'array',
		children: items
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createValue(value, location) {
	var node = {
		type: 'value',
		value: value
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createString(value, location) {
	var node = createValue(value, location);

	return node;
}

function createNumber(value, location) {
	var node = createValue(value, location);

	return node;
}

function createTrue(location) {
	var node = createValue('true', location);

	return node;
}

function createFalse(location) {
	var node = createValue('false', location);

	return node;
}

function createNull(location) {
	var node = createValue('null', location);

	return node;
}

module.exports = {
	location: location,
	createObjectKey: createObjectKey,
	createObjectProperty: createObjectProperty,
	createObject: createObject,
	createArray: createArray,
	// createValue: createValue,
	createString: createString,
	createNumber: createNumber,
	createTrue: createTrue,
	createFalse: createFalse,
	createNull: createNull
};
