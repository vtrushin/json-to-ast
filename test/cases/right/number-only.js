var types = require('../../src/types');
var location = types.location;
var number = types.createNumber;

module.exports = {
	ast: number('12345', location(1, 1, 0, 1, 6, 5)),
	options: {
		verbose: true
	}
};
