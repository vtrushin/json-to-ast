const FRAGMENT_MAX_LENGTH = 20;
const FRAGMENT_OVERFLOW_SYMBOLS = '…';

function showCodeFragment(source, linePosition, columnPosition) {
	let lines = source.split(/\n|\r\n?|\f/);
	let line = lines[linePosition - 1];
	let marker = new Array(columnPosition).join(' ') + '^';

	return `${line}\n${marker}`;
}

class ParseError extends SyntaxError {
	constructor(message, source, linePosition, columnPosition) {
		let fullMessage = linePosition
			? message + '\n' + showCodeFragment(source, linePosition, columnPosition)
			: message;
		super(fullMessage);
		this.rawMessage = message;
	}
}

export default function (message, source, line, column) {
	throw new ParseError(message, source, line, column);
}
