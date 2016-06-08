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

	// import error from './error';

	var tokenTypes = {
		LEFT_BRACE: Symbol('LEFT_BRACE'), // {
		RIGHT_BRACE: Symbol('RIGHT_BRACE'), // }
		LEFT_BRACKET: Symbol('LEFT_BRACKET'), // [
		RIGHT_BRACKET: Symbol('RIGHT_BRACKET'), // ]
		COLON: Symbol('COLON'), // :
		COMMA: Symbol('COMMA'), // ,
		STRING: Symbol('STRING'), //
		NUMBER: Symbol('NUMBER'), //
		TRUE: Symbol('TRUE'), // true
		FALSE: Symbol('FALSE'), // false
		NULL: Symbol('NULL') // null
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
		_START_: Symbol('_START_'),
		START_QUOTE_OR_CHAR: Symbol('START_QUOTE_OR_CHAR'),
		ESCAPE: Symbol('ESCAPE')
	};

	var escapes = {
		'"': Symbol('Quotation mask'),
		'\\': Symbol('Reverse solidus'),
		'/': Symbol('Solidus'),
		'b': Symbol('Backspace'),
		'f': Symbol('Form feed'),
		'n': Symbol('New line'),
		'r': Symbol('Carriage return'),
		't': Symbol('Horizontal tab'),
		'u': Symbol('4 hexadecimal digits')
	};

	var numberStates = {
		_START_: Symbol('_START_'),
		MINUS: Symbol('MINUS'),
		ZERO: Symbol('ZERO'),
		DIGIT: Symbol('DIGIT'),
		POINT: Symbol('POINT'),
		DIGIT_FRACTION: Symbol('DIGIT_FRACTION'),
		EXP: Symbol('EXP'),
		EXP_DIGIT_OR_SIGN: Symbol('EXP_DIGIT_OR_SIGN')
	};

	var errors = {
		tokenizeSymbol: function tokenizeSymbol(char, line, column) {
			error('Cannot tokenize symbol <' + char + '> at ' + line + ':' + column);
		}
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
		settings = _extends(defaultSettings$1, settings);
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
				errors.tokenizeSymbol(source.charAt(index), line.toString(), column.toString());
			}
		}

		return tokens;
	}

	var exceptionsDict = {
		tokenizeSymbolError: 'Cannot tokenize symbol <{char}> at {line}:{column}',
		emptyString: 'JSON is empty'
	};

	var objectStates = {
		_START_: 0,
		OPEN_OBJECT: 1,
		KEY: 2,
		KEY_AND_VALUE: 3,
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

	var Parser = function () {
		function Parser(source, settings) {
			_classCallCheck(this, Parser);

			this.settings = _extends(defaultSettings, settings);

			this.tokenList = tokenize(source, {
				verbose: settings.verbose
			});
			// console.log(this.tokenList);

			if (this.tokenList.length < 1) {
				throw new Error(exceptionsDict.emptyString);
			}

			this.index = 0;

			var json = this._parseValue();

			if (json) {
				return json;
			} else {
				throw new Error(exceptionsDict.emptyString);
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

				while (this.index < this.tokenList.length) {
					var token = this.tokenList[this.index];

					switch (state) {
						case objectStates._START_:
							if (token.type === tokenTypes.LEFT_BRACE) {
								startToken = token;
								this.index++;
								var nextToken = this.tokenList[this.index];
								if (nextToken.type === tokenTypes.STRING) {
									property = {
										type: 'property',
										key: {
											type: 'key',
											value: nextToken.value
										}
									};
									if (this.settings.verbose) {
										property.key.position = nextToken.position;
									}
									state = objectStates.KEY;
									this.index++;
								} else if (nextToken.type === tokenTypes.RIGHT_BRACE) {
									if (this.settings.verbose) {
										object.position = position(startToken.position.start.line, startToken.position.start.column, startToken.position.start.char, nextToken.position.end.line, nextToken.position.end.column, nextToken.position.end.char);
									}
									this.index++;
									return object;
								} else {
									return null;
								}
							} else {
								return null;
							}
							break;

						case objectStates.KEY_AND_VALUE:
							if (token.type == tokenTypes.COLON) {
								this.index++;
								var value = this._parseValue();

								if (value !== null) {
									property.value = value;
									object.properties.push(property);
									state = objectStates.VALUE;
								} else {
									return null;
								}
							} else {
								return null;
							}
							break;

						case objectStates.KEY:
							if (token.type == tokenTypes.COLON) {
								this.index++;
								var _value = this._parseValue();

								if (_value !== null) {
									property.value = _value;
									object.properties.push(property);
									state = objectStates.VALUE;
								} else {
									return null;
								}
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

				while (this.index < this.tokenList.length) {
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
				} else {
					var objectOrArray = this._parseObject() || this._parseArray();

					if (objectOrArray !== null) {
						return objectOrArray;
					} else {
						throw new Error('!!!!!');
					}
				}
			}
		}]);

		return Parser;
	}();

	module.exports = Parser;
});