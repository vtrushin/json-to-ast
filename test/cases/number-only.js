var types = require('../types');
var position = types.position;
var number = types.createNumber;

module.exports = {
	ast: number('12345', position(1, 1, 0, 1, 6, 5)),
	options: {
		verbose: true
	}
};
