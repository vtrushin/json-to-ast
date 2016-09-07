var types = require('../types');
var key = types.createObjectKey;
var position = types.position;
var object = types.createObject;
var prop = types.createObjectProperty;
var string = types.createString;
var _null = types.createNull;
var _true = types.createTrue;
var _false = types.createFalse;

var ast =
	object([
		prop(key('a', position(2, 3, 4, 2, 6, 7)), _null(position(2, 8, 9, 2, 12, 13))),
		prop(key('b', position(3, 3, 17, 3, 6, 20)), string('null', position(3, 8, 22, 3, 14, 28))),
		prop(key('c', position(4, 3, 32, 4, 6, 35)), _true(position(4, 8, 37, 4, 12, 41))),
		prop(key('d', position(5, 3, 45, 5, 6, 48)), string('true', position(5, 8, 50, 5, 14, 56))),
		prop(key('e', position(6, 3, 60, 6, 6, 63)), _false(position(6, 8, 65, 6, 13, 70))),
		prop(key('f', position(7, 3, 74, 7, 6, 77)), string('false', position(7, 8, 79, 7, 15, 86)))
	], position(1, 1, 0, 8, 2, 88));

module.exports = {
	ast: ast,
	options: {
		verbose: true
	}
};

