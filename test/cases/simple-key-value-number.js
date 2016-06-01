var types = require('../types');
var object = types.createObject;
var key = types.createObjectKey;
var prop = types.createObjectProperty;
var number = types.createNumber;

var ast =
	object([
		prop(key('a'), number('1')),
		prop(key('b'), number('1.2')),
		prop(key('c'), number('1.2e3')),
		prop(key('d'), number('1.2e-3'))
	]);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
