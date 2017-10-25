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

function createIdentifier(value, raw, location) {
	const node = {
		type: 'Identifier',
		value: value,
		raw: raw
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

function createProperty(key, value, location) {
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

module.exports = {
	location: location,
	createIdentifier: createIdentifier,
	createProperty: createProperty,
	createObject: createObject,
	createLiteral: createLiteral,
	createArray: createArray
};
