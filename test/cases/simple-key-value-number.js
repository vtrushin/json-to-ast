var types = require('../types');
var object = types.createObject;
var prop = types.createObjectProperty;
var number = types.createNumber;

var ast =
	object(
		prop('a', number('1')),
		prop('b', number('1.2')),
		prop('c', number('1.2e3')),
		prop('d', number('1.2e-3'))
	);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
