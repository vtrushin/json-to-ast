'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var JsonParser = (function () {
	'use strict';

	var exceptionsDict = {
		tokenizeSymbolError: 'Cannot tokenize symbol <{char}> at {line}:{column}',
		emptyString: 'JSON is empty'
	};

	function position(startLine, startColumn, startChar, endLine, endColumn, endChar) {
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
			human: startLine + ':' + startColumn + ' - ' + endLine + ':' + endColumn + ' [' + startChar + ':' + endChar + ']'
		};
	}

	var tokenTypes = {
		LEFT_BRACE: 'LEFT_BRACE', // {
		RIGHT_BRACE: 'RIGHT_BRACE', // }
		LEFT_BRACKET: 'LEFT_BRACKET', // [
		RIGHT_BRACKET: 'RIGHT_BRACKET', // ]
		COLON: 'COLON', // :
		COMMA: 'COMMA', // ,
		STRING: 'STRING', //
		NUMBER: 'NUMBER', //
		TRUE: 'TRUE', // true
		FALSE: 'FALSE', // false
		NULL: 'NULL' // null
	};

	var charTokens = {
		'{': tokenTypes.LEFT_BRACE,
		'}': tokenTypes.RIGHT_BRACE,
		'[': tokenTypes.LEFT_BRACKET,
		']': tokenTypes.RIGHT_BRACKET,
		':': tokenTypes.COLON,
		',': tokenTypes.COMMA
	};

	var keywordsTokens = {
		'true': tokenTypes.TRUE,
		'false': tokenTypes.FALSE,
		'null': tokenTypes.NULL
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
		DIGIT_1TO9: 3,
		DIGIT_CEIL: 4,
		POINT: 5,
		DIGIT_FRACTION: 6,
		EXP: 7,
		EXP_PLUS: 8,
		EXP_MINUS: 9,
		EXP_DIGIT: 10
	};

	var isDigit1to9 = function isDigit1to9(char) {
		return char >= '1' && char <= '9';
	};
	var isDigit = function isDigit(char) {
		return char >= '0' && char <= '9';
	};
	var isExp = function isExp(char) {
		return char === 'e' || char === 'E';
	};

	var Tokenizer = (function () {
		function Tokenizer(source) {
			_classCallCheck(this, Tokenizer);

			this.source = source;
			this.line = 1;
			this.column = 1;
			this.index = 0;
			this.currentToken = null;
			this.currentValue = null;
			var tokens = [];

			while (this.index < this.source.length) {
				var line = this.line;
				var column = this.column;
				var index = this.index;

				if (this._testWhitespace()) {
					continue;
				}

				var matched = this._testChar() || this._testKeyword() || this._testString() || this._testNumber();

				if (matched) {
					tokens.push({
						type: this.currentToken,
						value: this.currentValue,
						position: position(line, column, index, this.line, this.column, this.index)
					});

					this.currentValue = null;
				} else {
					throw new SyntaxError(exceptionsDict.tokenizeSymbolError.replace('{char}', this.source.charAt(this.index)).replace('{line}', this.line.toString()).replace('{column}', this.column.toString()));
				}
			}

			return tokens;
		}

		_createClass(Tokenizer, [{
			key: '_testWhitespace',
			value: function _testWhitespace() {
				var char = this.source.charAt(this.index);

				if (char === '\r' || char === '\n') {
					this.index++;
					this.line++;
					this.column = 1;
					return true;
				} else if (char === '\t' || char === ' ') {
					this.index++;
					this.column++;
					return true;
				} else {
					return false;
				}
			}
		}, {
			key: '_testChar',
			value: function _testChar() {
				var char = this.source.charAt(this.index);

				if (char in charTokens) {
					this.index++;
					this.column++;
					this.currentToken = charTokens[char];
					return true;
				} else {
					return false;
				}
			}
		}, {
			key: '_testKeyword',
			value: function _testKeyword() {
				var _this = this;

				var matched = Object.keys(keywordsTokens).find(function (name) {
					return name === _this.source.substr(_this.index, name.length);
				});

				if (matched) {
					var _length = matched.length;
					this.index += _length;
					this.column += _length;
					this.currentToken = keywordsTokens[matched];
					return true;
				} else {
					return false;
				}
			}
		}, {
			key: '_testString',
			value: function _testString() {
				var index = this.index;
				var buffer = '';
				var state = stringStates._START_;

				while (true) {
					var char = this.source.charAt(this.index);
					switch (state) {
						case stringStates._START_:
							if (char === '"') {
								state = stringStates.START_QUOTE_OR_CHAR;
								this.index++;
							} else {
								return false;
							}
							break;

						case stringStates.START_QUOTE_OR_CHAR:
							if (char === '\\') {
								state = stringStates.ESCAPE;
								buffer += char;
								this.index++;
							} else if (char === '"') {
								this.index++;
								this.column += this.index - index;
								this.currentToken = tokenTypes.STRING;
								this.currentValue = buffer;
								return true;
							} else {
								buffer += char;
								this.index++;
							}
							break;

						case stringStates.ESCAPE:
							if (char in escapes) {
								buffer += char;
								this.index++;
								if (char === 'u') {
									for (var i = 0; i < 4; i++) {
										var curChar = this.source.charAt(this.index);
										if (curChar && isDigit(curChar)) {
											buffer += curChar;
											this.index++;
										} else {
											return false;
										}
									}
								}
								state = stringStates.START_QUOTE_OR_CHAR;
							} else {
								return false;
							}
							break;
					}
				}
			}
		}, {
			key: '_testNumber',
			value: function _testNumber() {
				var index = this.index;
				var buffer = '';
				var passedValue = undefined;
				var state = numberStates._START_;

				iterator: while (true) {
					var char = this.source.charAt(index);

					switch (state) {
						case numberStates._START_:
							if (char === '-') {
								state = numberStates.MINUS;
								buffer += char;
								index++;
							} else if (char === '0') {
								state = numberStates.ZERO;
								buffer += char;
								index++;
								passedValue = buffer;
							} else if (isDigit1to9(char)) {
								state = numberStates.DIGIT_1TO9;
								buffer += char;
								index++;
								passedValue = buffer;
							} else {
								break iterator;
							}
							break;

						case numberStates.MINUS:
							if (char === '0') {
								state = numberStates.ZERO;
								buffer += char;
								index++;
								passedValue = buffer;
							} else if (isDigit1to9(char)) {
								state = numberStates.DIGIT_1TO9;
								buffer += char;
								index++;
								passedValue = buffer;
							} else {
								break iterator;
							}
							break;

						case numberStates.ZERO:
							if (char === '.') {
								state = numberStates.POINT;
								buffer += char;
								index++;
							} else if (isExp(char)) {
								state = numberStates.EXP;
								buffer += char;
								index++;
							} else {
								break iterator;
							}
							break;

						case numberStates.DIGIT_1TO9:
						case numberStates.DIGIT_CEIL:
							if (isDigit(char)) {
								state = numberStates.DIGIT_CEIL;
								buffer += char;
								index++;
								passedValue = buffer;
							} else if (char === '.') {
								state = numberStates.POINT;
								buffer += char;
								index++;
							} else if (isExp(char)) {
								state = numberStates.EXP;
								buffer += char;
								index++;
							} else {
								break iterator;
							}
							break;

						case numberStates.POINT:
							if (isDigit(char)) {
								state = numberStates.DIGIT_FRACTION;
								buffer += char;
								index++;
								passedValue = buffer;
							} else {
								break iterator;
							}
							break;

						case numberStates.DIGIT_FRACTION:
							if (isDigit(char)) {
								buffer += char;
								index++;
								passedValue = buffer;
							} else if (isExp(char)) {
								state = numberStates.EXP;
								buffer += char;
								index++;
							} else {
								break iterator;
							}
							break;

						case numberStates.EXP:
							if (char === '+') {
								state = numberStates.EXP_PLUS;
								buffer += char;
								index++;
							} else if (char === '-') {
								state = numberStates.EXP_MINUS;
								buffer += char;
								index++;
							} else if (isDigit(char)) {
								state = numberStates.EXP_DIGIT;
								buffer += char;
								index++;
								passedValue = buffer;
							} else {
								break iterator;
							}
							break;

						case numberStates.EXP_PLUS:
						case numberStates.EXP_MINUS:
						case numberStates.EXP_DIGIT:
							if (isDigit(char)) {
								state = numberStates.EXP_DIGIT;
								buffer += char;
								index++;
								passedValue = buffer;
							} else {
								break iterator;
							}
							break;
					}
				}

				if (passedValue) {
					this.index += passedValue.length;
					this.column += passedValue.length;
					this.currentToken = tokenTypes.NUMBER;
					this.currentValue = passedValue;
					return true;
				} else {
					return false;
				}
			}
		}]);

		return Tokenizer;
	})();

	Tokenizer.LEFT_BRACE = tokenTypes.LEFT_BRACE;
	Tokenizer.RIGHT_BRACE = tokenTypes.RIGHT_BRACE;
	Tokenizer.LEFT_BRACKET = tokenTypes.LEFT_BRACKET;
	Tokenizer.RIGHT_BRACKET = tokenTypes.RIGHT_BRACKET;
	Tokenizer.COLON = tokenTypes.COLON;
	Tokenizer.COMMA = tokenTypes.COMMA;
	Tokenizer.STRING = tokenTypes.STRING;
	Tokenizer.NUMBER = tokenTypes.NUMBER;
	Tokenizer.TRUE = tokenTypes.TRUE;
	Tokenizer.FALSE = tokenTypes.FALSE;
	Tokenizer.NULL = tokenTypes.NULL;

	return Tokenizer;
})();