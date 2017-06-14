var types = require('../../src/types');
var location = types.location;
var array = types.createArray;

var ast =
	array([
		array([
			array([
				array([
					array([
						array([
							array([
								array([], location(1, 8, 7, 1, 10, 9))
							], location(1, 7, 6, 1, 11, 10))
						], location(1, 6, 5, 1, 12, 11))
					], location(1, 5, 4, 1, 13, 12))
				], location(1, 4, 3, 1, 14, 13))
			], location(1, 3, 2, 1, 15, 14))
		], location(1, 2, 1, 1, 16, 15))
	], location(1, 1, 0, 1, 17, 16));

module.exports = {
	ast: ast,
	options: {
		verbose: true
	}
};
