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
		global.parseErrorTypes = mod.exports;
	}
})(this, function (module) {
	'use strict';

	var parseErrorTypes = {
		unexpectedEnd: function unexpectedEnd() {
			return 'Unexpected end of JSON input';
		},
		unexpectedToken: function unexpectedToken(token, line, column) {
			return 'Unexpected token <' + token + '> at ' + line + ':' + column;
		}
	};

	module.exports = parseErrorTypes;
});