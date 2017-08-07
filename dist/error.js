(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.error = mod.exports;
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	var FRAGMENT_MAX_LENGTH = 20;
	var FRAGMENT_OVERFLOW_SYMBOLS = '…';

	function showCodeFragment(source, linePosition, columnPosition) {
		var lines = source.split(/\n|\r\n?|\f/);
		var line = lines[linePosition - 1];
		var marker = new Array(columnPosition).join(' ') + '^';

		return line + '\n' + marker;
	}

	var ParseError = function (_SyntaxError) {
		_inherits(ParseError, _SyntaxError);

		function ParseError(message, source, linePosition, columnPosition) {
			_classCallCheck(this, ParseError);

			var fullMessage = linePosition ? message + '\n' + showCodeFragment(source, linePosition, columnPosition) : message;

			var _this = _possibleConstructorReturn(this, (ParseError.__proto__ || Object.getPrototypeOf(ParseError)).call(this, fullMessage));

			_this.rawMessage = message;
			return _this;
		}

		return ParseError;
	}(SyntaxError);

	exports.default = function (message, source, line, column) {
		throw new ParseError(message, source, line, column);
	};
});
//# sourceMappingURL=error.js.map
