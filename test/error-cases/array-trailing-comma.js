var errorTypes = require('../../dist/parseErrorTypes');

module.exports = {
	error: {
		message: errorTypes.unexpectedToken(']', 1, 4)
	}
};
