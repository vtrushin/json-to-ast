export default (startLine, startColumn, startOffset, endLine, endColumn, endOffset, fileName) => ({
	start: {
		line: startLine,
		column: startColumn,
		offset: startOffset
	},
	end: {
		line: endLine,
		column: endColumn,
		offset: endOffset
	},
	fileName: fileName || null
});
