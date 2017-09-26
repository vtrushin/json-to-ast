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

	var location = function location(startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) {
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

	var error = function error(message, source, line, column) {
		throw new ParseError(message, source, line, column);
	};

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
		NULL: 10 // null
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
		var char = input.charAt(index);

		if (char === '\r') {
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

	function parseChar(input, index, line, column) {
		var char = input.charAt(index);

		if (char in punctuatorTokensMap) {
			return {
				type: punctuatorTokensMap[char],
				line: line,
				column: column + 1,
				index: index + 1,
				value: null
			};
		}

		return null;
	}

	function parseKeyword(input, index, line, column) {
		for (var name in keywordTokensMap) {
			if (keywordTokensMap.hasOwnProperty(name) && input.substr(index, name.length) === name) {
				var _keywordTokensMap$nam = keywordTokensMap[name];
				var type = _keywordTokensMap$nam.type;
				var value = _keywordTokensMap$nam.value;


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

	function parseString(input, index, line, column) {
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
							return {
								type: tokenTypes.STRING,
								line: line,
								column: column + index - startIndex,
								index: index,
								value: buffer
							};
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

	function tokenize(input, settings) {
		var line = 1;
		var column = 1;
		var index = 0;
		var tokens = [];

		while (index < input.length) {
			var args = [input, index, line, column];
			var whitespace = parseWhitespace.apply(undefined, args);

			if (whitespace) {
				index = whitespace.index;
				line = whitespace.line;
				column = whitespace.column;
				continue;
			}

			var matched = parseChar.apply(undefined, args) || parseKeyword.apply(undefined, args) || parseString.apply(undefined, args) || parseNumber.apply(undefined, args);

			if (matched) {
				var token = {
					type: matched.type,
					value: matched.value,
					loc: location(line, column, index, matched.line, matched.column, matched.index, settings.source)
				};

				tokens.push(token);
				index = matched.index;
				line = matched.line;
				column = matched.column;
			} else {
				error(tokenizeErrorTypes.cannotTokenizeSymbol(input.charAt(index), line, column), input, line, column);
			}
		}

		return tokens;
	}

	var literals = [tokenTypes.STRING, tokenTypes.NUMBER, tokenTypes.TRUE, tokenTypes.FALSE, tokenTypes.NULL];

	var objectStates = {
		_START_: 0,
		OPEN_OBJECT: 1,
		PROPERTY: 2,
		COMMA: 3
	};

	var propertyStates = {
		_START_: 0,
		KEY: 1,
		COLON: 2
	};

	var arrayStates = {
		_START_: 0,
		OPEN_ARRAY: 1,
		VALUE: 2,
		COMMA: 3
	};

	var defaultSettings = {
		verbose: true,
		source: null
	};

	function parseObject(input, tokenList, index, settings) {
		// object: LEFT_BRACE (property (COMMA property)*)? RIGHT_BRACE
		var startToken = void 0;
		var object = {
			type: 'object',
			children: []
		};
		var state = objectStates._START_;

		while (index < tokenList.length) {
			var token = tokenList[index];

			switch (state) {
				case objectStates._START_:
					{
						if (token.type === tokenTypes.LEFT_BRACE) {
							startToken = token;
							state = objectStates.OPEN_OBJECT;
							index++;
						} else {
							return null;
						}
						break;
					}

				case objectStates.OPEN_OBJECT:
					{
						if (token.type === tokenTypes.RIGHT_BRACE) {
							if (settings.verbose) {
								object.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
							}
							return {
								value: object,
								index: index + 1
							};
						} else {
							var property = parseProperty(input, tokenList, index, settings);
							object.children.push(property.value);
							state = objectStates.PROPERTY;
							index = property.index;
						}
						break;
					}

				case objectStates.PROPERTY:
					{
						if (token.type === tokenTypes.RIGHT_BRACE) {
							if (settings.verbose) {
								object.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
							}
							return {
								value: object,
								index: index + 1
							};
						} else if (token.type === tokenTypes.COMMA) {
							state = objectStates.COMMA;
							index++;
						} else {
							error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
						}
						break;
					}

				case objectStates.COMMA:
					{
						var _property = parseProperty(input, tokenList, index, settings);
						if (_property) {
							index = _property.index;
							object.children.push(_property.value);
							state = objectStates.PROPERTY;
						} else {
							error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
						}
						break;
					}
			}
		}

		error(parseErrorTypes.unexpectedEnd());
	}

	function parseProperty(input, tokenList, index, settings) {
		// property: STRING COLON value
		var startToken = void 0;
		var property = {
			type: 'property',
			key: null,
			value: null
		};
		var state = objectStates._START_;

		while (index < tokenList.length) {
			var token = tokenList[index];

			switch (state) {
				case propertyStates._START_:
					{
						if (token.type === tokenTypes.STRING) {
							var key = {
								type: 'identifier',
								value: token.value
							};
							if (settings.verbose) {
								key.loc = token.loc;
							}
							startToken = token;
							property.key = key;
							state = propertyStates.KEY;
							index++;
						} else {
							return null;
						}
						break;
					}

				case propertyStates.KEY:
					{
						if (token.type === tokenTypes.COLON) {
							state = propertyStates.COLON;
							index++;
						} else {
							error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
						}
						break;
					}

				case propertyStates.COLON:
					{
						var value = parseValue(input, tokenList, index, settings);
						property.value = value.value;
						if (settings.verbose) {
							property.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, value.value.loc.end.line, value.value.loc.end.column, value.value.loc.end.offset, settings.source);
						}
						return {
							value: property,
							index: value.index
						};
					}

			}
		}
	}

	function parseArray(input, tokenList, index, settings) {
		// array: LEFT_BRACKET (value (COMMA value)*)? RIGHT_BRACKET
		var startToken = void 0;
		var array = {
			type: 'array',
			children: []
		};
		var state = arrayStates._START_;
		var token = void 0;

		while (index < tokenList.length) {
			token = tokenList[index];

			switch (state) {
				case arrayStates._START_:
					{
						if (token.type === tokenTypes.LEFT_BRACKET) {
							startToken = token;
							state = arrayStates.OPEN_ARRAY;
							index++;
						} else {
							return null;
						}
						break;
					}

				case arrayStates.OPEN_ARRAY:
					{
						if (token.type === tokenTypes.RIGHT_BRACKET) {
							if (settings.verbose) {
								array.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
							}
							return {
								value: array,
								index: index + 1
							};
						} else {
							var value = parseValue(input, tokenList, index, settings);
							index = value.index;
							array.children.push(value.value);
							state = arrayStates.VALUE;
						}
						break;
					}

				case arrayStates.VALUE:
					{
						if (token.type === tokenTypes.RIGHT_BRACKET) {
							if (settings.verbose) {
								array.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
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
							error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
						}
						break;
					}

				case arrayStates.COMMA:
					{
						var _value = parseValue(input, tokenList, index, settings);
						index = _value.index;
						array.children.push(_value.value);
						state = arrayStates.VALUE;
						break;
					}
			}
		}

		error(parseErrorTypes.unexpectedEnd());
	}

	function parseLiteral(input, tokenList, index, settings) {
		// literal: STRING | NUMBER | TRUE | FALSE | NULL
		var token = tokenList[index];

		var isLiteral = literals.indexOf(token.type) !== -1;

		if (isLiteral) {
			var literal = {
				type: 'literal',
				value: token.value,
				rawValue: input.substring(token.loc.start.offset, token.loc.end.offset)
			};
			if (settings.verbose) {
				literal.loc = token.loc;
			}
			return {
				value: literal,
				index: index + 1
			};
		}

		return null;
	}

	function parseValue(input, tokenList, index, settings) {
		// value: literal | object | array
		var token = tokenList[index];

		var value = parseLiteral.apply(undefined, arguments) || parseObject.apply(undefined, arguments) || parseArray.apply(undefined, arguments);

		if (value) {
			return value;
		} else {
			error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
		}
	}

	var parse = function parse(input, settings) {
		settings = _extends({}, defaultSettings, settings);
		var tokenList = tokenize(input, settings);

		if (tokenList.length === 0) {
			error(parseErrorTypes.unexpectedEnd());
		}

		var value = parseValue(input, tokenList, 0, settings);

		if (value.index === tokenList.length) {
			return value.value;
		} else {
			var token = tokenList[value.index];
			error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
		}
	};

	module.exports = parse;
});