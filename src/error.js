const FRAGMENT_MAX_LENGTH = 20;
const FRAGMENT_OVERFLOW_SYMBOLS = '…';

function showCodeFragment(source, linePosition, columnPosition) {
	const lines = source.split(/\n|\r\n?|\f/);
	const line = lines[linePosition - 1];
	const marker = new Array(columnPosition).join(' ') + '^';

	return line + '\n' + marker;
}

class ParseError extends SyntaxError {
	constructor(message, source, linePosition, columnPosition) {
		const fullMessage = linePosition
			? message + '\n' + showCodeFragment(source, linePosition, columnPosition)
			: message;
		super(fullMessage);
		this.rawMessage = message;
	}
}

export default (message, source, line, column) => {
	throw new ParseError(message, source, line, column);
}
