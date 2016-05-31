var types = require('../types');
var position = types.position;
var array = types.createArray;

module.exports = {
	ast: array([], position(1, 1, 0, 1, 3, 2)),
	options: {
		verbose: true
	}
};
