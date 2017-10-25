var types = require('../../types');
var location = types.location;
var literal = types.createLiteral;

module.exports = {
	ast: literal(12345, '12345', location(1, 1, 0, 1, 6, 5)),
	options: {
		loc: true
	}
};
