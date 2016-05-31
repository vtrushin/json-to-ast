var types = require('../types');
var position = types.position;
var string = types.createString;

module.exports = {
	ast: string('Some text', position(1, 1, 0, 1, 12, 11)),
	options: {
		verbose: true
	}
};
