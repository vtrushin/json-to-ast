export default {
	unexpectedEnd: () => (
		'Unexpected end of JSON input'
	),
	unexpectedToken: (token, line, column) => (
		`Unexpected token <${token}> at ${line}:${column}`
	)
};
