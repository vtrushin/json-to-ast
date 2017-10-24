var types = require('../../types');
var array = types.createArray;
var literal = types.createLiteral;

var ast = array([
	literal(1, '1'),
	literal(1.2, '1.2'),
	literal(1.2e3, '1.2e3'),
	literal(1.2e-3, '1.2e-3')
]);

module.exports = {
	ast: ast,
	options: {
		loc: false
	}
};
