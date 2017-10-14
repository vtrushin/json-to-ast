const OVERFLOW_SYMBOLS = '\u2026'; // …
const EXTRA_LINES = 2;
const MAX_LINE_LENGTH = 100;
const OFFSET_CORRECTION = 60;
const TAB_REPLACEMENT = '	';

function sourceFragment(input, line, column) {
	function printLines(start, end) {
		return lines.slice(start, end).map(function(line, idx) {
			let num = String(start + idx + 1);

			while (num.length < maxNumLength) {
				num = ' ' + num;
			}

			return num + ' |' + line;
		}).join('\n');
	}

	let lines = input.split(/\r\n?|\n|\f/);
	let startLine = Math.max(1, line - EXTRA_LINES) - 1;
	let endLine = Math.min(line + EXTRA_LINES, lines.length + 1);
	let maxNumLength = Math.max(4, String(endLine).length) + 1;
	let cutLeft = 0;

	// column correction according to replaced tab before column
	column += (TAB_REPLACEMENT.length - 1) * (lines[line - 1].substr(0, column - 1).match(/\t/g) || []).length;

	if (column > MAX_LINE_LENGTH) {
		cutLeft = column - OFFSET_CORRECTION + 3;
		column = OFFSET_CORRECTION - 2;
	}

	for (let i = startLine; i <= endLine; i++) {
		if (i >= 0 && i < lines.length) {
			lines[i] = lines[i].replace(/\t/g, TAB_REPLACEMENT);
			lines[i] =
				(cutLeft > 0 && lines[i].length > cutLeft ? OVERFLOW_SYMBOLS : '') +
				lines[i].substr(cutLeft, MAX_LINE_LENGTH - 2) +
				(lines[i].length > cutLeft + MAX_LINE_LENGTH - 1 ? OVERFLOW_SYMBOLS : '');
		}
	}

	return [
		printLines(startLine, line),
		new Array(column + maxNumLength + 2).join('-') + '^',
		printLines(line, endLine)
	].filter(Boolean).join('\n');
}

export default (message, input, source, line, column) => {
    // use Object.create(), because some VMs prevent setting line/column otherwise
    // (iOS Safari 10 even throws an exception)
    let error = Object.create(SyntaxError.prototype);
    let errorStack = new Error();

    error.name = 'SyntaxError';
    error.message = line
        ? message + '\n' + sourceFragment(input, line, column)
        : message;
    error.rawMessage = message;
    error.source = source;
    error.line = line;
    error.column = column;

    Object.defineProperty(error, 'stack', {
        get: function() {
            return (errorStack.stack || '').replace(/^(.+\n){1,3}/, String(error) + '\n');
        }
    });

    throw error;
}
