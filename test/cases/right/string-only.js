var types = require('../../src/types');
var location = types.location;
var string = types.createString;

module.exports = {
	ast: string('Some text', location(1, 1, 0, 1, 12, 11)),
	options: {
		verbose: true
	}
};
