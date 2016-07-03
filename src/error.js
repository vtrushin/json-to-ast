export default function (message, symbol, line, column) {
	throw new SyntaxError(
		message
			.replace('{symbol}', symbol)
			.replace('{position}', `${line}:${column}`)
	);
}
