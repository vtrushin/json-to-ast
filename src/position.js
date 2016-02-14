export default function (startLine, startColumn, startChar, endLine, endColumn, endChar) {
	return {
		start: {
			line: startLine,
			column: startColumn,
			char: startChar
		},
		end: {
			line: endLine,
			column: endColumn,
			char: endChar
		},
		human: `${startLine}:${startColumn} - ${endLine}:${endColumn} [${startChar}:${endChar}]`
	}
}