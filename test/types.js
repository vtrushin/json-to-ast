function location(startLine, startColumn, startOffset, endLine, endColumn, endOffset) {
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
		}
	}
}

function createObjectKey(value, location) {
	var result = {
		type: 'key',
		value: value
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

function createObjectProperty(key, value) {
	return {
		type: 'property',
		key: key,
		value: value
	}
}

function createObject(properties, location) {
	var result = {
		type: 'object',
		properties: properties
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

function createArray(items, location) {
	var result = {
		type: 'array',
		items: items
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

function createString(value, location) {
	var result = {
		type: 'string',
		value: value
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

function createNumber(value, location) {
	var result = {
		type: 'number',
		value: value
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

function createTrue(location) {
	var result = {
		type: 'true',
		value: null
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

function createFalse(location) {
	var result = {
		type: 'false',
		value: null
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

function createNull(location) {
	var result = {
		type: 'null',
		value: null
	};

	if (location) {
		result.loc = location;
	}

	return result;
}

module.exports = {
	location: location,
	createObjectKey: createObjectKey,
	createObjectProperty: createObjectProperty,
	createObject: createObject,
	createArray: createArray,
	createString: createString,
	createNumber: createNumber,
	createTrue: createTrue,
	createFalse: createFalse,
	createNull: createNull
};
