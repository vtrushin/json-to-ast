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
		global.Parser = mod.exports;
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
				index: index + matched.length
			};
		} else {
			return null;
		}
	}

	function parseString(source, index, line, column) {
		var startIndex = index;
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
						if (isUnicode(char)) {
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
			return {
				token: tokenTypes.NUMBER,
				value: passedValue,
				line: line,
				index: index + passedValue.length,
				column: column + passedValue.length
			};
		} else {
			return null;
		}
	}

	function tokenize(source) {
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
				tokens.push({
					type: matched.type,
					value: matched.value,
					position: position(line, column, index, matched.line, matched.column, matched.index)
				});
				index = matched.index;
				line = matched.line;
				column = matched.column;
			} else {
				throw new SyntaxError(exceptionsDict.tokenizeSymbolError.replace('{char}', source.charAt(index)).replace('{line}', line.toString()).replace('{column}', column.toString()));
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

	var Parser = function () {
		function Parser(source, settings) {
			_classCallCheck(this, Parser);

			this.settings = _extends(defaultSettings, settings);

			this.tokenList = tokenize(source);
			// console.log(this.tokenList);
			this.index = 0;

			var json = this._parseValue();

			if (json) {
				return json;
			} else {
				throw new SyntaxError(exceptionsDict.emptyString);
			}
		}

		_createClass(Parser, [{
			key: '_parseObject',
			value: function _parseObject() {
				var startToken = void 0;
				var property = void 0;
				var object = {
					type: 'object',
					properties: []
				};
				var state = objectStates._START_;

				while (true) {
					var token = this.tokenList[this.index];

					switch (state) {
						case objectStates._START_:
							if (token.type === tokenTypes.LEFT_BRACE) {
								startToken = token;
								state = objectStates.OPEN_OBJECT;
								this.index++;
							} else {
								return null;
							}
							break;

						case objectStates.OPEN_OBJECT:
							if (token.type === tokenTypes.STRING) {
								property = {
									type: 'property'
								};
								if (this.settings.verbose) {
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
								this.index++;
							} else if (token.type === tokenTypes.RIGHT_BRACE) {
								if (this.settings.verbose) {
									object.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
								}
								this.index++;
								return object;
							} else {
								return null;
							}
							break;

						case objectStates.KEY:
							if (token.type == tokenTypes.COLON) {
								state = objectStates.COLON;
								this.index++;
							} else {
								return null;
							}
							break;

						case objectStates.COLON:
							var value = this._parseValue();

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
								if (this.settings.verbose) {
									object.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
								}
								this.index++;
								return object;
							} else if (token.type === tokenTypes.COMMA) {
								state = objectStates.COMMA;
								this.index++;
							} else {
								return null;
							}
							break;

						case objectStates.COMMA:
							if (token.type === tokenTypes.STRING) {
								property = {
									type: 'property'
								};
								if (this.settings.verbose) {
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
								this.index++;
							} else {
								return null;
							}

					}
				}
			}
		}, {
			key: '_parseArray',
			value: function _parseArray() {
				var startToken = void 0;
				var value = void 0;
				var array = {
					type: 'array',
					items: []
				};
				var state = arrayStates._START_;

				while (true) {
					var token = this.tokenList[this.index];

					switch (state) {
						case arrayStates._START_:
							if (token.type === tokenTypes.LEFT_BRACKET) {
								startToken = token;
								state = arrayStates.OPEN_ARRAY;
								this.index++;
							} else {
								return null;
							}
							break;

						case arrayStates.OPEN_ARRAY:
							// console.log(token);

							if (token.type === tokenTypes.RIGHT_BRACKET) {
								if (this.settings.verbose) {
									array.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
								}
								this.index++;
								return array;
							} else {

								value = this._parseValue();
								if (value !== null) {
									array.items.push(value);
									state = arrayStates.VALUE;
								} else {
									return null;
								}
							}

							/*if (value !== null) {
       	array.items.push(value);
       	state = arrayStates.VALUE;
       } else if (token.type === tokenTypes.RIGHT_BRACKET) {
       	if (this.settings.verbose) {
       		array.position = position(
       			startToken.position.start.line,
       			startToken.position.start.column,
       			startToken.position.start.char,
       			token.position.end.line,
       			token.position.end.column,
       			token.position.end.char
       		);
       	}
       	this.index ++;
       	return array;
       } else {
       	return null;
       }*/
							break;

						case arrayStates.VALUE:
							if (token.type === tokenTypes.RIGHT_BRACKET) {
								if (this.settings.verbose) {
									array.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, token.position.end.line, token.position.end.column, token.position.end.char);
								}
								this.index++;
								return array;
							} else if (token.type === tokenTypes.COMMA) {
								state = arrayStates.COMMA;
								this.index++;
							} else {
								return null;
							}
							break;

						case arrayStates.COMMA:
							value = this._parseValue();
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
		}, {
			key: '_parseValue',
			value: function _parseValue() {
				// value: object | array | STRING | NUMBER | TRUE | FALSE | NULL
				var token = this.tokenList[this.index];

				if (token.type === 'RIGHT_BRACKET') {
					debugger;
				}

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

				var objectOrArray = this._parseObject() || this._parseArray();

				if (tokenType !== undefined) {
					this.index++;

					if (this.settings.verbose) {
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
		}]);

		return Parser;
	}();

	module.exports = Parser;
});