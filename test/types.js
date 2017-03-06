function position(startLine, startColumn, startOffset, endLine, endColumn, endOffset) {
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

function createObjectKey(value, position) {
	var result = {
		type: 'key',
		value: value
	};

	if (position) {
		result.position = position;
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

function createObject(properties, position) {
	var result = {
		type: 'object',
		properties: properties
	};

	if (position) {
		result.position = position;
	}

	return result;
}

function createArray(items, position) {
	var result = {
		type: 'array',
		items: items
	};

	if (position) {
		result.position = position;
	}

	return result;
}

function createString(value, position) {
	var result = {
		type: 'string',
		value: value
	};

	if (position) {
		result.position = position;
	}

	return result;
}

function createNumber(value, position) {
	var result = {
		type: 'number',
		value: value
	};

	if (position) {
		result.position = position;
	}

	return result;
}

function createTrue(position) {
	var result = {
		type: 'true',
		value: null
	};

	if (position) {
		result.position = position;
	}

	return result;
}

function createFalse(position) {
	var result = {
		type: 'false',
		value: null
	};

	if (position) {
		result.position = position;
	}

	return result;
}

function createNull(position) {
	var result = {
		type: 'null',
		value: null
	};

	if (position) {
		result.position = position;
	}

	return result;
}

module.exports = {
	position: position,
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
