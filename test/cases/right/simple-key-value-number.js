var types = require('../../src/types');
var object = types.createObject;
var key = types.createObjectKey;
var prop = types.createObjectProperty;
var literal = types.createLiteral;
var number = types.createNumber;

var ast =
	object([
		prop(key('a'), number(1)),
		prop(key('b'), number(1.2)),
		prop(key('c'), literal(1200, '1.2e3')),
		prop(key('d'), literal(0.0012, '1.2e-3'))
	]);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
