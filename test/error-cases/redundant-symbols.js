var errorTypes = require('../../dist/parseErrorTypes');
var tokenTypes = require('../../dist/tokenize').tokenTypes;

module.exports = {
	error: {
		message: errorTypes.unexpectedToken(tokenTypes.RIGHT_BRACE, 1, 9)
	}
};
