export default (startLine, startColumn, startChar, endLine, endColumn, endChar) => ({
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
});
