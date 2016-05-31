var types = require('../types');
var object = types.createObject;
var prop = types.createObjectProperty;
var array = types.createArray;
var string = types.createString;
var number = types.createNumber;

var ast = object(
	prop('a<', number('2')),
	prop('b)', object(
		prop('c(', array(
			string('3!'),
			string('4:'),
			string('5;'),
			string('6\'')
		)),
		prop('d&', object(
			prop('e!', string('~_~'))
		)),
		prop(':e', string('|')),
		prop(' f ', string('*±*∆'))
	))
);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
