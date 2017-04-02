export default {
	cannotTokenizeSymbol: (symbol, line, column) => (
		`Cannot tokenize symbol <${symbol}> at ${line}:${column}`
	)
};
