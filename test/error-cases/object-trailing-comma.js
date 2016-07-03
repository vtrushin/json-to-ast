var errorTypes = require('../../dist/parseErrorTypes');

module.exports = {
	error: {
		message: errorTypes.unexpectedToken('}', 3, 1)
	}
};
