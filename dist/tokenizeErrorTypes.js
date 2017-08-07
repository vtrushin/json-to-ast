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
		global.tokenizeErrorTypes = mod.exports;
	}
})(this, function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		cannotTokenizeSymbol: function cannotTokenizeSymbol(symbol, line, column) {
			return "Cannot tokenize symbol <" + symbol + "> at " + line + ":" + column;
		}
	};
});
//# sourceMappingURL=tokenizeErrorTypes.js.map
