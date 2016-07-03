(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['module'], factory);
	} else if (typeof exports !== "undefined") {
		factory(module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod);
		global.error = mod.exports;
	}
})(this, function (module) {
	'use strict';

	function error(message, symbol, line, column) {
		throw new SyntaxError(message);
	}

	module.exports = error;
});