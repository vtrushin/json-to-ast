export default (startLine, startColumn, startOffset, endLine, endColumn, endOffset, source = '<unknown>') => ({
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
	source
});
