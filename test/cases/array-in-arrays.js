var array = require('../types').createArray;

var ast =
	array(
		array(
			array(
				array(
					array(
						array(
							array(
								array()
							)
						)
					)
				)
			)
		)
	);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
