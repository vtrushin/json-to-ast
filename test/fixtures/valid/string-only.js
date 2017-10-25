var types = require('../../types');
var location = types.location;
var literal = types.createLiteral;

module.exports = {
	ast: literal('Some text', '"Some text"', location(1, 1, 0, 1, 12, 11)),
	options: {
		loc: true
	}
};
