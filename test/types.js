function location(startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) {
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
		source: source || null
	}
}

function createObjectKey(value, location) {
	const node = {
		type: 'Identifier',
		value: value,
		raw: '"' + value + '"'
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createObjectProperty(key, value, location) {
	const node = {
		type: 'Property',
		key: key,
		value: value
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createObject(properties, location) {
	const node = {
		type: 'Object',
		children: properties
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createArray(items, location) {
	const node = {
		type: 'Array',
		children: items
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createLiteral(value, raw, location) {
	const node = {
		type: 'Literal',
		value: value,
		raw: raw
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createString(value, location) {
	return createLiteral(value, '"' + value + '"', location);
}

function createNumber(value, location) {
	return createLiteral(value, String(value), location);
}

function createTrue(location) {
	return createLiteral(true, 'true', location);
}

function createFalse(location) {
	return createLiteral(false, 'false', location);
}

function createNull(location) {
	return createLiteral(null, 'null', location);
}

module.exports = {
	location: location,
	createObjectKey: createObjectKey,
	createObjectProperty: createObjectProperty,
	createObject: createObject,
	createLiteral: createLiteral,
	createArray: createArray,
	createString: createString,
	createNumber: createNumber,
	createTrue: createTrue,
	createFalse: createFalse,
	createNull: createNull
};
