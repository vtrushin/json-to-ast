(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.location = mod.exports;
	}
})(this, function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function (startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) {
		return {
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
			source: source || null
		};
	};
});
//# sourceMappingURL=location.js.map
