function createObjectProperty(key, value) {
	return {
		type: 'property',
		key: {
			type: 'key',
			value: key
		},
		value: value
	}
}

function createObject() {
	return {
		type: 'object',
		properties: Array.prototype.slice.call(arguments)
	}
}

function createArray() {
	return {
		type: 'array',
		items: Array.prototype.slice.call(arguments)
	}
}

function createString(value) {
	return {
		type: 'string',
		value: value
	}
}

function createNumber(value) {
	return {
		type: 'number',
		value: value
	}
}

function createTrue() {
	return {
		type: 'true',
		value: null
	}
}

function createFalse() {
	return {
		type: 'false',
		value: null
	}
}

function createNull() {
	return {
		type: 'null',
		value: null
	}
}

module.exports = {
	createObjectProperty: createObjectProperty,
	createObject: createObject,
	createArray: createArray,
	createString: createString,
	createNumber: createNumber,
	createTrue: createTrue,
	createFalse: createFalse,
	createNull: createNull
};
