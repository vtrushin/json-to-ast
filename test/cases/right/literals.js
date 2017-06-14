var types = require('../../src/types');
var key = types.createObjectKey;
var location = types.location;
var object = types.createObject;
var prop = types.createObjectProperty;
var string = types.createString;
var _null = types.createNull;
var _true = types.createTrue;
var _false = types.createFalse;

var ast =
	object([
		prop(
			key('a', location(2, 3, 4, 2, 6, 7)),
			_null(location(2, 8, 9, 2, 12, 13)),
			location(2, 3, 4, 2, 12, 13)
		),
		prop(
			key('b', location(3, 3, 17, 3, 6, 20)),
			string('null', location(3, 8, 22, 3, 14, 28)),
			location(3, 3, 17, 3, 14, 28)
		),
		prop(
			key('c', location(4, 3, 32, 4, 6, 35)),
			_true(location(4, 8, 37, 4, 12, 41)),
			location(4, 3, 32, 4, 12, 41)
		),
		prop(
			key('d', location(5, 3, 45, 5, 6, 48)),
			string('true', location(5, 8, 50, 5, 14, 56)),
			location(5, 3, 45, 5, 14, 56)
		),
		prop(
			key('e', location(6, 3, 60, 6, 6, 63)),
			_false(location(6, 8, 65, 6, 13, 70)),
			location(6, 3, 60, 6, 13, 70)
		),
		prop(
			key('f', location(7, 3, 74, 7, 6, 77)),
			string('false', location(7, 8, 79, 7, 15, 86)),
			location(7, 3, 74, 7, 15, 86)
		)
	], location(1, 1, 0, 8, 2, 88));

module.exports = {
	ast: ast,
	options: {
		verbose: true
	}
};

