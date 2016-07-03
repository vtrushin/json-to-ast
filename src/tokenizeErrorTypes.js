export default {
	cannotTokenizeSymbol(symbol, line, column) {
		return `Cannot tokenize symbol <${symbol}> at ${line}:${column}`;
	}
};
