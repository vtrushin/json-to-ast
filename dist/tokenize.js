(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './location', './error', './tokenizeErrorTypes'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./location'), require('./error'), require('./tokenizeErrorTypes'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.location, global.error, global.tokenizeErrorTypes);
		global.tokenize = mod.exports;
	}
})(this, function (exports, _location, _error, _tokenizeErrorTypes) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Tokenizer = exports.tokenTypes = undefined;

	var _location2 = _interopRequireDefault(_location);

	var _error2 = _interopRequireDefault(_error);

	var _tokenizeErrorTypes2 = _interopRequireDefault(_tokenizeErrorTypes);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	var tokenTypes = exports.tokenTypes = {
		LEFT_BRACE: 0, // {
		RIGHT_BRACE: 1, // }
		LEFT_BRACKET: 2, // [
		RIGHT_BRACKET: 3, // ]
		COLON: 4, // :
		COMMA: 5, // ,
		STRING: 6, //
		NUMBER: 7, //
		TRUE: 8, // true
		FALSE: 9, // false
		NULL: 10, // null
		COMMENT: 11,
		WHITESPACE: 12
	};

	var punctuatorTokensMap = { // Lexeme: Token
		'{': tokenTypes.LEFT_BRACE,
		'}': tokenTypes.RIGHT_BRACE,
		'[': tokenTypes.LEFT_BRACKET,
		']': tokenTypes.RIGHT_BRACKET,
		':': tokenTypes.COLON,
		',': tokenTypes.COMMA
	};

	var keywordTokensMap = { // Lexeme: Token config
		'true': { type: tokenTypes.TRUE, value: true },
		'false': { type: tokenTypes.FALSE, value: false },
		'null': { type: tokenTypes.NULL, value: null }
	};

	var stringStates = {
		_START_: 0,
		START_QUOTE_OR_CHAR: 1,
		ESCAPE: 2
	};

	var escapes = {
		'"': 0, // Quotation mask
		'\\': 1, // Reverse solidus
		'/': 2, // Solidus
		'b': 3, // Backspace
		'f': 4, // Form feed
		'n': 5, // New line
		'r': 6, // Carriage return
		't': 7, // Horizontal tab
		'u': 8 // 4 hexadecimal digits
	};

	var numberStates = {
		_START_: 0,
		MINUS: 1,
		ZERO: 2,
		DIGIT: 3,
		POINT: 4,
		DIGIT_FRACTION: 5,
		EXP: 6,
		EXP_DIGIT_OR_SIGN: 7
	};

	// HELPERS

	function isDigit1to9(char) {
		return char >= '1' && char <= '9';
	}

	function isDigit(char) {
		return char >= '0' && char <= '9';
	}

	function isHex(char) {
		return isDigit(char) || char >= 'a' && char <= 'f' || char >= 'A' && char <= 'F';
	}

	function isExp(char) {
		return char === 'e' || char === 'E';
	}

	// PARSERS

	function parseWhitespace(input, index, line, column) {
		var value = "";

		while (true) {
			var char = input.charAt(index);
			if (char === '\r') {
				// CR (Unix)
				index++;
				line++;
				column = 1;
				value += char;
				if (input.charAt(index) === '\n') {
					// CRLF (Windows)
					index++;
					value += '\n';
				}
			} else if (char === '\n') {
				// LF (MacOS)
				index++;
				line++;
				column = 1;
				value += char;
			} else if (char === '\t' || char === ' ') {
				index++;
				column++;
				value += char;
			} else {
				break;
			}
		}
		if (value.length == 0) return null;

		return {
			index: index,
			line: line,
			column: column,
			type: tokenTypes.WHITESPACE,
			value: value
		};
	}

	function parseComment(input, index, line, column) {
		var str = input.substring(index, index + 2);
		var startIndex = index;

		if (str === "/*") {
			for (index += 2; index < input.length; index++) {
				var char = input[index];
				if (char === '*' && input[index + 1] === '/') {
					index += 2;
					column += 2;
					break;
				} else if (char === '\r') {
					// CR (Unix)
					index++;
					line++;
					column = 1;
					if (input.charAt(index) === '\n') {
						// CRLF (Windows)
						index++;
					}
				} else if (char === '\n') {
					// LF (MacOS)
					index++;
					line++;
					column = 1;
				} else column++;
			}
			return {
				index: index,
				line: line,
				column: column,
				type: tokenTypes.COMMENT,
				value: input.substring(startIndex, index)
			};
		} else if (str === "//") {
			for (index += 2; index < input.length; index++) {
				var char = input[index];
				if (char === '\r') {
					// CR (Unix)
					index++;
					line++;
					column = 1;
					if (input.charAt(index) === '\n') {
						// CRLF (Windows)
						index++;
					}
					break;
				} else if (char === '\n') {
					// LF (MacOS)
					index++;
					line++;
					column = 1;
					break;
				}
			}

			return {
				index: index,
				line: line,
				column: column,
				type: tokenTypes.COMMENT,
				value: input.substring(startIndex, index)
			};
		}

		return null;
	}

	function parseChar(input, index, line, column) {
		var char = input.charAt(index);

		if (char in punctuatorTokensMap) {
			return {
				type: punctuatorTokensMap[char],
				line: line,
				column: column + 1,
				index: index + 1,
				value: char
			};
		}

		return null;
	}

	function parseKeyword(input, index, line, column) {
		for (var name in keywordTokensMap) {
			if (keywordTokensMap.hasOwnProperty(name) && input.substr(index, name.length) === name) {
				var _keywordTokensMap$nam = keywordTokensMap[name],
				    type = _keywordTokensMap$nam.type,
				    value = _keywordTokensMap$nam.value;


				return {
					type: type,
					line: line,
					column: column + name.length,
					index: index + name.length,
					value: value
				};
			}
		}

		return null;
	}

	function parseString(input, index, line, column, settings) {
		var startIndex = index;
		var buffer = '';
		var state = stringStates._START_;

		while (index < input.length) {
			var char = input.charAt(index);

			switch (state) {
				case stringStates._START_:
					{
						if (char === '"') {
							state = stringStates.START_QUOTE_OR_CHAR;
							index++;
						} else {
							return null;
						}
						break;
					}

				case stringStates.START_QUOTE_OR_CHAR:
					{
						if (char === '\\') {
							state = stringStates.ESCAPE;
							buffer += char;
							index++;
						} else if (char === '"') {
							index++;
							var result = {
								type: tokenTypes.STRING,
								line: line,
								column: column + index - startIndex,
								index: index,
								value: buffer
							};
							if (settings.verbose) result.rawValue = input.substring(startIndex, index);
							return result;
						} else {
							buffer += char;
							index++;
						}
						break;
					}

				case stringStates.ESCAPE:
					{
						if (char in escapes) {
							buffer += char;
							index++;
							if (char === 'u') {
								for (var i = 0; i < 4; i++) {
									var curChar = input.charAt(index);
									if (curChar && isHex(curChar)) {
										buffer += curChar;
										index++;
									} else {
										return null;
									}
								}
							}
							state = stringStates.START_QUOTE_OR_CHAR;
						} else {
							return null;
						}
						break;
					}
			}
		}
	}

	function parseNumber(input, index, line, column) {
		var startIndex = index;
		var passedValueIndex = index;
		var state = numberStates._START_;

		iterator: while (index < input.length) {
			var char = input.charAt(index);

			switch (state) {
				case numberStates._START_:
					{
						if (char === '-') {
							state = numberStates.MINUS;
						} else if (char === '0') {
							passedValueIndex = index + 1;
							state = numberStates.ZERO;
						} else if (isDigit1to9(char)) {
							passedValueIndex = index + 1;
							state = numberStates.DIGIT;
						} else {
							return null;
						}
						break;
					}

				case numberStates.MINUS:
					{
						if (char === '0') {
							passedValueIndex = index + 1;
							state = numberStates.ZERO;
						} else if (isDigit1to9(char)) {
							passedValueIndex = index + 1;
							state = numberStates.DIGIT;
						} else {
							return null;
						}
						break;
					}

				case numberStates.ZERO:
					{
						if (char === '.') {
							state = numberStates.POINT;
						} else if (isExp(char)) {
							state = numberStates.EXP;
						} else {
							break iterator;
						}
						break;
					}

				case numberStates.DIGIT:
					{
						if (isDigit(char)) {
							passedValueIndex = index + 1;
						} else if (char === '.') {
							state = numberStates.POINT;
						} else if (isExp(char)) {
							state = numberStates.EXP;
						} else {
							break iterator;
						}
						break;
					}

				case numberStates.POINT:
					{
						if (isDigit(char)) {
							passedValueIndex = index + 1;
							state = numberStates.DIGIT_FRACTION;
						} else {
							break iterator;
						}
						break;
					}

				case numberStates.DIGIT_FRACTION:
					{
						if (isDigit(char)) {
							passedValueIndex = index + 1;
						} else if (isExp(char)) {
							state = numberStates.EXP;
						} else {
							break iterator;
						}
						break;
					}

				case numberStates.EXP:
					{
						if (char === '+' || char === '-') {
							state = numberStates.EXP_DIGIT_OR_SIGN;
						} else if (isDigit(char)) {
							passedValueIndex = index + 1;
							state = numberStates.EXP_DIGIT_OR_SIGN;
						} else {
							break iterator;
						}
						break;
					}

				case numberStates.EXP_DIGIT_OR_SIGN:
					{
						if (isDigit(char)) {
							passedValueIndex = index + 1;
						} else {
							break iterator;
						}
						break;
					}
			}

			index++;
		}

		if (passedValueIndex > 0) {
			return {
				type: tokenTypes.NUMBER,
				line: line,
				column: column + passedValueIndex - startIndex,
				index: passedValueIndex,
				value: parseFloat(input.substring(startIndex, passedValueIndex))
			};
		}

		return null;
	}

	var Tokenizer = exports.Tokenizer = function () {
		function Tokenizer(input, settings) {
			_classCallCheck(this, Tokenizer);

			this.input = input;
			this.settings = settings || {};
			this.tokens = null;
			this.tokenIndex = -1;
		}

		_createClass(Tokenizer, [{
			key: 'token',
			value: function token() {
				if (this.tokens === null) throw new Error("No tokens to return (have you called tokenize?)");
				if (this.tokenIndex >= this.tokens.length) throw new Error("No more tokens available");
				if (this.tokenIndex < 0) return this.next();
				return this.tokens[this.tokenIndex];
			}
		}, {
			key: 'hasMore',
			value: function hasMore() {
				if (this.tokens === null) throw new Error("No tokens to return (have you called tokenize?)");

				if (this.settings.returnWhitespace) {
					return this.tokenIndex < this.tokens.length;
				}

				var tokenIndex = this.tokenIndex;
				if (tokenIndex < 0) tokenIndex = 0;
				for (; tokenIndex < this.tokens.length; tokenIndex++) {
					var token = this.tokens[tokenIndex];
					if (token.type != tokenTypes.COMMENT && token.type != tokenTypes.WHITESPACE) return true;
				}
				return false;
			}
		}, {
			key: 'next',
			value: function next() {
				if (this.tokens === null) throw new Error("No tokens to return (have you called tokenize?)");
				if (this.tokenIndex >= this.tokens.length) throw new Error("No more tokens to get");

				if (this.settings.returnWhitespace) {
					if (this.tokenIndex < this.tokens.length) return this.tokens[++this.tokenIndex];
				} else {
					for (++this.tokenIndex; this.tokenIndex < this.tokens.length; this.tokenIndex++) {
						var token = this.tokens[this.tokenIndex];
						if (token.type != tokenTypes.COMMENT && token.type != tokenTypes.WHITESPACE) return token;
					}
				}

				return null;
			}
		}, {
			key: 'tokenize',
			value: function tokenize() {
				var line = 1;
				var column = 1;
				var index = 0;
				var tokens = this.tokens = [];
				var input = this.input;

				while (index < input.length) {
					var args = [input, index, line, column, this.settings];

					var matched = parseWhitespace.apply(undefined, args) || parseComment.apply(undefined, args) || parseChar.apply(undefined, args) || parseKeyword.apply(undefined, args) || parseString.apply(undefined, args) || parseNumber.apply(undefined, args);

					if (matched) {
						var token = {
							type: matched.type,
							value: matched.value,
							loc: (0, _location2.default)(line, column, index, matched.line, matched.column, matched.index, this.settings.source)
						};
						if (matched.rawValue) token.rawValue = matched.rawValue;

						tokens.push(token);
						index = matched.index;
						line = matched.line;
						column = matched.column;
					} else {
						(0, _error2.default)(_tokenizeErrorTypes2.default.cannotTokenizeSymbol(input.charAt(index), line, column), input, line, column);
					}
				}

				return tokens;
			}
		}]);

		return Tokenizer;
	}();
});
//# sourceMappingURL=tokenize.js.map
