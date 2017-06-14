var types = require('../../src/types');
var object = types.createObject;
var key = types.createObjectKey;
var prop = types.createObjectProperty;
var array = types.createArray;
var string = types.createString;
var number = types.createNumber;

var ast = object([
	prop(key('a<'), number('2')),
	prop(key('b)'), object([
		prop(key('c('), array([
			string('3!'),
			string('4:'),
			string('5;'),
			string('6\'')
		])),
		prop(key('d&'), object([
			prop(key('e!'), string('~_~'))
		])),
		prop(key(':e'), string('|')),
		prop(key(' f '), string('*±*∆'))
	]))
]);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
