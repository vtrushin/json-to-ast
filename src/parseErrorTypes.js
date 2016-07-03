export default {
	unexpectedEnd() {
		return 'Unexpected end of JSON input'
	},
	unexpectedToken(token, line, column) {
		return `Unexpected token <${token}> at ${line}:${column}`
	}
};
