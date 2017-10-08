export default {
	unexpectedEnd: () => (
		'Unexpected end of input'
	),
	unexpectedToken: (token, ...position) => (
		`Unexpected token <${token}> at ${position.filter(Boolean).join(':')}`
	)
};
