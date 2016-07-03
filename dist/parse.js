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

	var _extends = Object.assign || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

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

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParseError).call(this, fullMessage));

			_this.rawMessage = message;
			return _this;
		}

		return ParseError;
	}(SyntaxError);

	function error(message, source, line, column) {
		throw new ParseError(message, source, line, column);
	}

	var parseErrorTypes = {
		unexpectedEnd: function unexpectedEnd() {
			return 'Unexpected end of JSON input';
		},
		unexpectedToken: function unexpectedToken(token, line, column) {
			return 'Unexpected token <' + token + '> at ' + line + ':' + column;
		}
	};

	var tokenizeErrorTypes = {
		cannotTokenizeSymbol: function cannotTokenizeSymbol(symbol, line, column) {
			return 'Cannot tokenize symbol <' + symbol + '> at ' + line + ':' + column;
		}
	};

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

	function parseWhitespace(source, index, line, column) {
		var char = source.charAt(index);

		if (char === '\r') {
			// CR (Unix)
			index++;
			line++;
			column = 1;
			if (source.charAt(index + 1) === '\n') {
				// CRLF (Windows)
				index++;
			}
		} else if (char === '\n') {
			// LF (MacOS)
			index++;
			line++;
			column = 1;
		} else if (char === '\t' || char === ' ') {
			index++;
			column++;
		} else {
			return null;
		}

		return {
			index: index,
			line: line,
			column: column
		};
	}

	function parseChar(source, index, line, column) {
		var char = source.charAt(index);

		if (char in charTokens) {
			return {
				type: charTokens[char],
				line: line,
				column: column + 1,
				index: index + 1
			};
		} else {
			return null;
		}
	}

	function parseKeyword(source, index, line, column) {
		var matched = Object.keys(keywordsTokens).find(function (name) {
			return name === source.substr(index, name.length);
		});

		if (matched) {
			return {
				type: keywordsTokens[matched],
				line: line,
				column: column + matched.length,
				index: index + matched.length,
				value: null
			};
		} else {
			return null;
		}
	}

	function parseString(source, index, line, column) {
		var startIndex = index;
		var buffer = '';
		var state = stringStates._START_;

		while (index < source.length) {
			var char = source.charAt(index);

			switch (state) {
				case stringStates._START_:
					if (char === '"') {
						state = stringStates.START_QUOTE_OR_CHAR;
						index++;
					} else {
						return null;
					}
					break;

				case stringStates.START_QUOTE_OR_CHAR:
					if (char === '\\') {
						state = stringStates.ESCAPE;
						buffer += char;
						index++;
					} else if (char === '"') {
						index++;
						return {
							type: tokenTypes.STRING,
							value: buffer,
							line: line,
							index: index,
							column: column + index - startIndex
						};
					} else {
						buffer += char;
						index++;
					}
					break;

				case stringStates.ESCAPE:
					if (char in escapes) {
						buffer += char;
						index++;
						if (char === 'u') {
							for (var i = 0; i < 4; i++) {
								var curChar = source.charAt(index);
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

	function parseNumber(source, index, line, column) {
		var startIndex = index;
		var passedValueIndex = index;
		var state = numberStates._START_;

		iterator: while (index < source.length) {
			var char = source.charAt(index);

			switch (state) {
				case numberStates._START_:
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

				case numberStates.MINUS:
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

				case numberStates.ZERO:
					if (char === '.') {
						state = numberStates.POINT;
					} else if (isExp(char)) {
						state = numberStates.EXP;
					} else {
						break iterator;
					}
					break;

				case numberStates.DIGIT:
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

				case numberStates.POINT:
					if (isDigit(char)) {
						passedValueIndex = index + 1;
						state = numberStates.DIGIT_FRACTION;
					} else {
						break iterator;
					}
					break;

				case numberStates.DIGIT_FRACTION:
					if (isDigit(char)) {
						passedValueIndex = index + 1;
					} else if (isExp(char)) {
						state = numberStates.EXP;
					} else {
						break iterator;
					}
					break;

				case numberStates.EXP:
					if (char === '+' || char === '-') {
						state = numberStates.EXP_DIGIT_OR_SIGN;
					} else if (isDigit(char)) {
						passedValueIndex = index + 1;
						state = numberStates.EXP_DIGIT_OR_SIGN;
					} else {
						break iterator;
					}
					break;

				case numberStates.EXP_DIGIT_OR_SIGN:
					if (isDigit(char)) {
						passedValueIndex = index + 1;
					} else {
						break iterator;
					}
					break;
			}

			index++;
		}

		if (passedValueIndex > 0) {
			return {
				type: tokenTypes.NUMBER,
				value: source.substring(startIndex, passedValueIndex),
				line: line,
				index: passedValueIndex,
				column: column + passedValueIndex - startIndex
			};
		} else {
			return null;
		}
	}

	var defaultSettings$1 = {
		verbose: true
	};

	function tokenize(source, settings) {
		settings = _extends({}, defaultSettings$1, settings);
		var line = 1;
		var column = 1;
		var index = 0;
		var tokens = [];

		while (index < source.length) {
			var whitespace = parseWhitespace(source, index, line, column);

			if (whitespace) {
				index = whitespace.index;
				line = whitespace.line;
				column = whitespace.column;
				continue;
			}

			var matched = parseChar(source, index, line, column) || parseKeyword(source, index, line, column) || parseString(source, index, line, column) || parseNumber(source, index, line, column);

			if (matched) {
				var token = {
					type: matched.type,
					value: matched.value
				};

				if (settings.verbose) {
					token.position = position(line, column, index, matched.line, matched.column, matched.index);
				}

				tokens.push(token);
				index = matched.index;
				line = matched.line;
				column = matched.column;
			} else {
				error(tokenizeErrorTypes.cannotTokenizeSymbol(source.charAt(index), line, column), source, line, column);
			}
		}

		return tokens;
	}

	var objectStates = {
		_START_: 0,
		OPEN_OBJECT: 1,
		KEY: 2,
		COLON: 3,
		VALUE: 4,
		COMMA: 5
	};

	var arrayStates = {
		_START_: 0,
		OPEN_ARRAY: 1,
		VALUE: 2,
		COMMA: 3
	};

	var defaultSettings = {
		verbose: true
	};

	var primitiveTokenTypes = {
		'string': tokenTypes.STRING,
		'number': tokenTypes.NUMBER,
		'true': tokenTypes.TRUE,
		'false': tokenTypes.FALSE,
		'null': tokenTypes.NULL
	};

	function parseObject(source, tokenList, index, settings) {
		var startToken = void 0;
		var property = void 0;
		var object = {
			type: 'object',
			properties: []
		};
		var state = objectStates._START_;
		var token = void 0;

		while (index < tokenList.length) {
			token = tokenList[index];

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
							type: 'property',
							key: {
								type: 'key',
								value: token.value
							}
						};
						if (settings.verbose) {
							property.key.position = token.position;
						}
						state = objectStates.KEY;
						index++;
					} else if (token.type === tokenTypes.RIGHT_BRACE) {
						if (settings.verbose) {
							object.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
						}
						index++;
						return {
							value: object,
							index: index
						};
					} else {
						error(parseErrorTypes.unexpectedToken(source.substring(token.position.start.char, token.position.end.char), token.position.start.line, token.position.start.column), source, token.position.start.line, token.position.start.column);
					}
					break;

				case objectStates.KEY:
					if (token.type === tokenTypes.COLON) {
						state = objectStates.COLON;
						index++;
					} else {
						error(parseErrorTypes.unexpectedToken(source.substring(token.position.start.char, token.position.end.char), token.position.start.line, token.position.start.column), source, token.position.start.line, token.position.start.column);
					}
					break;

				case objectStates.COLON:
					var value = parseValue(source, tokenList, index, settings);
					index = value.index;
					property.value = value.value;
					object.properties.push(property);
					state = objectStates.VALUE;
					break;

				case objectStates.VALUE:
					if (token.type === tokenTypes.RIGHT_BRACE) {
						if (settings.verbose) {
							object.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
						}
						index++;
						return {
							value: object,
							index: index
						};
					} else if (token.type === tokenTypes.COMMA) {
						state = objectStates.COMMA;
						index++;
					} else {
						error(parseErrorTypes.unexpectedToken(source.substring(token.position.start.char, token.position.end.char), token.position.start.line, token.position.start.column), source, token.position.start.line, token.position.start.column);
					}
					break;

				case objectStates.COMMA:
					if (token.type === tokenTypes.STRING) {
						property = {
							type: 'property',
							key: {
								type: 'key',
								value: token.value
							}
						};
						if (settings.verbose) {
							property.key = {
								position: token.position
							};
						}
						state = objectStates.KEY;
						index++;
					} else {
						error(parseErrorTypes.unexpectedToken(source.substring(token.position.start.char, token.position.end.char), token.position.start.line, token.position.start.column), source, token.position.start.line, token.position.start.column);
					}
					break;
			}
		}

		error(parseErrorTypes.unexpectedEnd());
	}

	function parseArray(source, tokenList, index, settings) {
		var startToken = void 0;
		var array = {
			type: 'array',
			items: []
		};
		var state = arrayStates._START_;
		var token = void 0;

		while (index < tokenList.length) {
			token = tokenList[index];

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
					if (token.type === tokenTypes.RIGHT_BRACKET) {
						if (settings.verbose) {
							array.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
						}
						index++;
						return {
							value: array,
							index: index
						};
					} else {
						var _value = parseValue(source, tokenList, index, settings);
						index = _value.index;
						array.items.push(_value.value);
						state = arrayStates.VALUE;
					}
					break;

				case arrayStates.VALUE:
					if (token.type === tokenTypes.RIGHT_BRACKET) {
						if (settings.verbose) {
							array.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
						}
						index++;
						return {
							value: array,
							index: index
						};
					} else if (token.type === tokenTypes.COMMA) {
						state = arrayStates.COMMA;
						index++;
					} else {
						error(parseErrorTypes.unexpectedToken(source.substring(token.position.start.char, token.position.end.char), token.position.start.line, token.position.start.column), source, token.position.start.line, token.position.start.column);
					}
					break;

				case arrayStates.COMMA:
					var value = parseValue(source, tokenList, index, settings);
					index = value.index;
					array.items.push(value.value);
					state = arrayStates.VALUE;
					break;
			}
		}

		error(parseErrorTypes.unexpectedEnd());
	}

	function parseValue(source, tokenList, index, settings) {
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

		if (tokenType) {
			index++;
			var value = {
				type: tokenType,
				value: token.value
			};
			if (settings.verbose) {
				value.position = token.position;
			}
			return {
				value: value,
				index: index
			};
		} else {
			var objectOrValue = parseObject(source, tokenList, index, settings) || parseArray(source, tokenList, index, settings);

			if (objectOrValue) {
				return objectOrValue;
			} else {
				error(parseErrorTypes.unexpectedToken(source.substring(token.position.start.char, token.position.end.char), token.position.start.line, token.position.start.column), source, token.position.start.line, token.position.start.column);
			}
		}
	}

	function parse(source, settings) {
		settings = _extends({}, defaultSettings, settings);
		var tokenList = tokenize(source);

		if (tokenList.length === 0) {
			error(parseErrorTypes.unexpectedEnd(), source, 1, 1);
		}

		var value = parseValue(source, tokenList, 0, settings);

		if (value.index === tokenList.length) {
			return value.value;
		} else {
			var token = tokenList[value.index];
			error(parseErrorTypes.unexpectedToken(source.substring(token.position.start.char, token.position.end.char), token.position.start.line, token.position.start.column), source, token.position.start.line, token.position.start.column);
		}
	}

	module.exports = parse;
});