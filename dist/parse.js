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
		global.parse = mod.exports;
	}
})(this, function (module) {
	'use strict';

	if (!Object.assign) {
		Object.defineProperty(Object, 'assign', {
			enumerable: false,
			configurable: true,
			writable: true,
			value: function value(target, firstSource) {
				'use strict';

				if (target === undefined || target === null) {
					throw new TypeError('Cannot convert first argument to object');
				}

				var to = Object(target);
				for (var i = 1; i < arguments.length; i++) {
					var nextSource = arguments[i];
					if (nextSource === undefined || nextSource === null) {
						continue;
					}

					var keysArray = Object.keys(Object(nextSource));
					for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
						var nextKey = keysArray[nextIndex];
						var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
						if (desc !== undefined && desc.enumerable) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
				return to;
			}
		});
	}

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
	var isHex = function isHex(char) {
		return isDigit(char) || char >= 'a' && char <= 'f' || char >= 'A' && char <= 'F';
	};
	var isExp = function isExp(char) {
		return char === 'e' || char === 'E';
	};
	var isUnicode = function isUnicode(char) {
		return char === 'u' || char === 'U';
	};

	function tokenize(source) {
		var line = 1;
		var column = 1;
		var index = 0;
		var currentToken = null;
		var currentValue = null;
		var tokens = [];

		while (index < source.length) {
			var _line = line;
			var _column = column;
			var _index = index;

			if (testWhitespace()) {
				continue;
			}

			var matched = testChar() || testKeyword() || testString() || testNumber();

			if (matched) {
				tokens.push({
					type: currentToken,
					value: currentValue,
					position: position(_line, _column, _index, line, column, index)
				});

				currentValue = null;
			} else {
				throw new SyntaxError(exceptionsDict.tokenizeSymbolError.replace('{char}', source.charAt(index)).replace('{line}', line.toString()).replace('{column}', column.toString()));
			}
		}

		function testWhitespace() {
			var char = source.charAt(index);

			if (source.charAt(index) === '\r' && source.charAt(index + 1) === '\n') {
				// CRLF (Windows)
				index += 2;
				line++;
				column = 1;
				return true;
			} else if (char === '\r' || char === '\n') {
				// CR (Unix) or LF (MacOS)
				index++;
				line++;
				column = 1;
				return true;
			} else if (char === '\t' || char === ' ') {
				index++;
				column++;
				return true;
			} else {
				return false;
			}
		}

		function testChar() {
			var char = source.charAt(index);

			if (char in charTokens) {
				index++;
				column++;
				currentToken = charTokens[char];
				return true;
			} else {
				return false;
			}
		}

		function testKeyword() {
			var matched = Object.keys(keywordsTokens).find(function (name) {
				return name === source.substr(index, name.length);
			});

			if (matched) {
				var length = matched.length;
				index += length;
				column += length;
				currentToken = keywordsTokens[matched];
				return true;
			} else {
				return false;
			}
		}

		function testString() {
			var buffer = '';
			var state = stringStates._START_;

			while (true) {
				var char = source.charAt(index);
				switch (state) {
					case stringStates._START_:
						if (char === '"') {
							state = stringStates.START_QUOTE_OR_CHAR;
							index++;
						} else {
							return false;
						}
						break;

					case stringStates.START_QUOTE_OR_CHAR:
						if (char === '\\') {
							state = stringStates.ESCAPE;
							buffer += char;
							index++;
						} else if (char === '"') {
							index++;
							column += index - index;
							currentToken = tokenTypes.STRING;
							currentValue = buffer;
							return true;
						} else {
							buffer += char;
							index++;
						}
						break;

					case stringStates.ESCAPE:
						if (char in escapes) {
							buffer += char;
							index++;
							if (isUnicode(char)) {
								for (var i = 0; i < 4; i++) {
									var curChar = source.charAt(index);
									if (curChar && isHex(curChar)) {
										buffer += curChar;
										index++;
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

		function testNumber() {
			var buffer = '';
			var passedValue = void 0;
			var state = numberStates._START_;

			iterator: while (true) {
				var char = source.charAt(index);

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
				index += passedValue.length;
				column += passedValue.length;
				currentToken = tokenTypes.NUMBER;
				currentValue = passedValue;
				return true;
			} else {
				return false;
			}
		}

		return tokens;
	}

	// import '../node_modules/babel-polyfill/dist/polyfill';

	console.log(Array.from({ a: 1, b: 2 }));

	var objectStates = {
		_START_: 0,
		OPEN_OBJECT: 1,
		KEY: 2,
		COLON: 3,
		VALUE: 4,
		COMMA: 5,
		CLOSE_OBJECT: 6
	};

	var arrayStates = {
		_START_: 0,
		OPEN_ARRAY: 1,
		VALUE: 2,
		COMMA: 3,
		CLOSE_ARRAY: 4
	};

	var defaultSettings = {
		verbose: true
	};

	function parse(source, settings) {
		settings = Object.assign(defaultSettings, settings);
		var tokenList = tokenize(source);
		var index = 0;
		var json = parseValue();

		function parseObject() {
			var startToken = void 0;
			var property = void 0;
			var object = {
				type: 'object',
				properties: []
			};
			var state = objectStates._START_;

			while (true) {
				var token = tokenList[index];

				switch (state) {
					case objectStates._START_:
						if (token.type === tokenTypes.LEFT_BRACE) {
							startToken = token;
							state = objectStates.OPEN_OBJECT;
							index++;
						} else {
							return null;
						}
						break;

					case objectStates.OPEN_OBJECT:
						if (token.type === tokenTypes.STRING) {
							property = {
								type: 'property'
							};
							if (settings.verbose) {
								property.key = {
									type: 'key',
									position: token.position,
									value: token.value
								};
							} else {
								property.key = {
									type: 'key',
									value: token.value
								};
							}
							state = objectStates.KEY;
							index++;
						} else if (token.type === tokenTypes.RIGHT_BRACE) {
							if (settings.verbose) {
								object.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
							}
							index++;
							return object;
						} else {
							return null;
						}
						break;

					case objectStates.KEY:
						if (token.type == tokenTypes.COLON) {
							state = objectStates.COLON;
							index++;
						} else {
							return null;
						}
						break;

					case objectStates.COLON:
						var value = parseValue();

						if (value !== null) {
							property.value = value;
							object.properties.push(property);
							state = objectStates.VALUE;
						} else {
							return null;
						}
						break;

					case objectStates.VALUE:
						if (token.type === tokenTypes.RIGHT_BRACE) {
							if (settings.verbose) {
								object.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
							}
							index++;
							return object;
						} else if (token.type === tokenTypes.COMMA) {
							state = objectStates.COMMA;
							index++;
						} else {
							return null;
						}
						break;

					case objectStates.COMMA:
						if (token.type === tokenTypes.STRING) {
							property = {
								type: 'property'
							};
							if (settings.verbose) {
								property.key = {
									type: 'key',
									position: token.position,
									value: token.value
								};
							} else {
								property.key = {
									type: 'key',
									value: token.value
								};
							}
							state = objectStates.KEY;
							index++;
						} else {
							return null;
						}

				}
			}
		}

		function parseArray() {
			var startToken = void 0;
			var value = void 0;
			var array = {
				type: 'array',
				items: []
			};
			var state = arrayStates._START_;

			while (true) {
				var token = tokenList[index];

				switch (state) {
					case arrayStates._START_:
						if (token.type === tokenTypes.LEFT_BRACKET) {
							startToken = token;
							state = arrayStates.OPEN_ARRAY;
							index++;
						} else {
							return null;
						}
						break;

					case arrayStates.OPEN_ARRAY:
						value = parseValue();
						if (value !== null) {
							array.items.push(value);
							state = arrayStates.VALUE;
						} else if (token.type === tokenTypes.RIGHT_BRACKET) {
							if (settings.verbose) {
								array.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
							}
							index++;
							return array;
						} else {
							return null;
						}
						break;

					case arrayStates.VALUE:
						if (token.type === tokenTypes.RIGHT_BRACKET) {
							if (settings.verbose) {
								array.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
							}
							index++;
							return array;
						} else if (token.type === tokenTypes.COMMA) {
							state = arrayStates.COMMA;
							index++;
						} else {
							return null;
						}
						break;

					case arrayStates.COMMA:
						value = parseValue();
						if (value !== null) {
							array.items.push(value);
							state = arrayStates.VALUE;
						} else {
							return null;
						}
						break;
				}
			}
		}

		function parseValue() {
			// value: object | array | STRING | NUMBER | TRUE | FALSE | NULL
			var token = tokenList[index];
			var tokenType = void 0;

			switch (token.type) {
				case tokenTypes.STRING:
					tokenType = 'string';
					break;
				case tokenTypes.NUMBER:
					tokenType = 'number';
					break;
				case tokenTypes.TRUE:
					tokenType = 'true';
					break;
				case tokenTypes.FALSE:
					tokenType = 'false';
					break;
				case tokenTypes.NULL:
					tokenType = 'null';
			}

			var objectOrArray = parseObject() || parseArray();

			if (tokenType !== undefined) {
				index++;

				if (settings.verbose) {
					return {
						type: tokenType,
						value: token.value,
						position: token.position
					};
				} else {
					return {
						type: tokenType,
						value: token.value
					};
				}
			} else if (objectOrArray !== null) {
				return objectOrArray;
			} else {
				throw new Error('!!!!!');
			}
		}

		if (json) {
			return json;
		} else {
			throw new SyntaxError(exceptionsDict.emptyString);
		}
	}

	module.exports = parse;
});