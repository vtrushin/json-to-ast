export default {
	unexpectedSymbol: (symbol, ...position) => (
		`Unexpected symbol <${symbol}> at ${position.filter(Boolean).join(':')}`
	)
};
