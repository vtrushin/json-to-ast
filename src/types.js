export function location(startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) {
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

export function createObjectKey(value, location) {
	var node = {
		type: 'identifier',
		value: value
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

export function createObjectProperty(key, value, location) {
	var node = {
		type: 'property',
		key: key,
		value: value
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

export function createObject(properties, location) {
	var node = {
		type: 'object',
		children: properties
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

export function createArray(items, location) {
	var node = {
		type: 'array',
		children: items
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

export function createLiteral(value, rawValue, location) {
	var node = {
		type: 'literal',
		value: value,
		rawValue: rawValue
	};

	if (location) {
		node.loc = location;
	}

	return node;
}

export function createString(value, location) {
	return createLiteral(value, '"' + value + '"', location);
}

export function createNumber(value, location) {
	return createLiteral(value, String(value), location);
}

export function createTrue(location) {
	return createLiteral(true, 'true', location);
}

export function createFalse(location) {
	return createLiteral(false, 'false', location);
}

export function createNull(location) {
	return createLiteral(null, 'null', location);
}

