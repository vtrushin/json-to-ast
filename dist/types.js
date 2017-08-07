(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.types = mod.exports;
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.location = location;
	exports.createObjectKey = createObjectKey;
	exports.createObjectProperty = createObjectProperty;
	exports.createObject = createObject;
	exports.createArray = createArray;
	exports.createLiteral = createLiteral;
	exports.createString = createString;
	exports.createNumber = createNumber;
	exports.createTrue = createTrue;
	exports.createFalse = createFalse;
	exports.createNull = createNull;
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
		};
	}

	function createObjectKey(value, location) {
		var node = {
			type: 'identifier',
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
			key: key,
			value: value
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

	function createLiteral(value, rawValue, location) {
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
});
//# sourceMappingURL=types.js.map
