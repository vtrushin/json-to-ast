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

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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

			var _this = _possibleConstructorReturn(this, (ParseError.__proto__ || Object.getPrototypeOf(ParseError)).call(this, fullMessage));

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

	function tokenize(input, settings) {
		var line = 1;
		var column = 1;
		var index = 0;
		var tokens = [];
		var comments = [];

		while (index < input.length) {
			var args = [input, index, line, column, settings];
			var whitespace = parseWhitespace.apply(undefined, args);

			if (whitespace) {
				index = whitespace.index;
				line = whitespace.line;
				column = whitespace.column;
				continue;
			}

			var _comment = parseComment.apply(undefined, args);
			if (_comment) {
				comments.push({
					value: _comment.value,
					loc: location(line, column, index, _comment.line, _comment.column, _comment.index)
				});
				index = _comment.index;
				line = _comment.line;
				column = _comment.column;
				continue;
			}

			var matched = parseChar.apply(undefined, args) || parseKeyword.apply(undefined, args) || parseString.apply(undefined, args) || parseNumber.apply(undefined, args);

			if (matched) {
				var token = {
					type: matched.type,
					value: matched.value,
					loc: location(line, column, index, matched.line, matched.column, matched.index, settings.source)
				};
				if (matched.rawValue) token.rawValue = matched.rawValue;
				if (comments.length) {
					token.comments = comments;
					comments = [];
				}

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

	function createObjectKey(value, location) {
		var node = {
			type: 'identifier',
			value: value
		};

		if (location) {
			node.loc = location;
		}

		return node;
	}

	function createObjectProperty(key, value, location) {
		var node = {
			type: 'property',
			key: key,
			value: value
		};

		if (location) {
			node.loc = location;
		}

		return node;
	}

	function createObject(properties, location) {
		var node = {
			type: 'object',
			children: properties
		};

		if (location) {
			node.loc = location;
		}

		return node;
	}

	function createArray(items, location) {
		var node = {
			type: 'array',
			children: items
		};

		if (location) {
			node.loc = location;
		}

		return node;
	}

	function createLiteral(value, rawValue, location) {
		var node = {
			type: 'literal',
			value: value,
			rawValue: rawValue
		};

		if (location) {
			node.loc = location;
		}

		return node;
	}

	function Writer() {
		this.buffer = "";
	}

	Writer.prototype = {
		buffer: null,
		__indent: 0,
		__indentStr: "",
		__currentLine: 0,

		write: function write(str) {
			var t = this;

			for (var index = 0; index < str.length; index++) {
				var pos = str.indexOf('\n');
				if (pos > -1) {
					this.buffer += str.substring(index, pos + 1);
					this.__currentLine = this.buffer.length;
					this.buffer += this.__indentStr;
					index = pos;
				} else {
					this.buffer += str.substring(index);
					break;
				}
			}

			return this;
		},

		comments: function comments(_comments) {
			var t = this;
			if (_comments) {
				_comments.forEach(function (comment) {
					t.write(comment.source + "\n");
				});
			}
		},

		indent: function indent(count) {
			var str = "";
			for (var i = 0; i < count; i++) {
				str += "  ";
			}var line = this.buffer.substring(this.__currentLine);
			if (line == this.__indentStr) {
				this.buffer = this.buffer.substring(0, this.__currentLine) + str;
			}
			this.__indentStr = str;

			return this;
		}
	};

	function prettyPrint(ast) {
		var writer = new Writer();

		function writeNode(node) {
			switch (node.type) {
				case "object":
					writer.comments(node.leadingComments);
					writer.write("{\n").indent(+1);
					node.children.forEach(function (child, index) {
						if (index > 0) writer.write(",\n");
						writer.write("\"" + child.key.value + "\" : ");
						writeNode(child.value);
					});
					if (node.children.length) writer.write("\n");
					writer.comments(node.trailingComments);
					writer.indent(-1).write("}\n");
					break;

				case "array":
					writer.comments(node.leadingComments);
					writer.write("[\n").indent(+1);
					node.children.forEach(function (child, index) {
						if (index > 0) writer.write(",\n");
						writeNode(child.value);
					});
					if (node.children.length) writer.write("\n");
					writer.comments(node.trailingComments);
					writer.indent(-1).write("]\n");
					break;

				case "property":
					writeNode(node.key);
					writer.write(" : ");
					writeNode(node.value);
					break;

				case "identifier":
					writer.write("\"" + node.value + "\"");
					break;

				case "literal":
					writer.comments(node.leadingComments);
					writer.write(node.rawValue);
					writer.comments(node.trailingComments);
					break;

				default:
					throw new Error("Unexpected node type '" + node.type + "'");
			}
		}

		writeNode(ast);

		return writer.buffer;
	}

	function rewrite(ast) {
		var output = "";
		var tokenList = ast.tokenList;
		var tokenIndex = 0;
		var lastToken = null;
		var lastLoc = null;

		function advanceTo(from, to) {
			var line = from.line;
			var column = from.column;
			while (line < to.line) {
				output += "\n";
				line++;
				column = 1;
			}
			while (column < to.column) {
				output += " ";
				column++;
			}
		}

		function writeToken(token) {
			if (typeof token == "number") token = tokenList[token];
			if (token) {
				var nibs = [token];
				if (token.comments) nibs = nibs.concat(token.comments).sort(function (l, r) {
					l = l.loc.start;
					r = r.loc.start;
					if (l.line < r.line) return -1;
					if (l.line > r.line) return 1;
					return l.column < r.column ? -1 : l.column > r.column ? 1 : 0;
				});
				nibs.forEach(function (nib) {
					if (lastLoc != null) {
						advanceTo(lastLoc.end, nib.loc.start);
					}
					lastLoc = nib.loc;
					if (nib.rawValue !== undefined) output += nib.rawValue;else output += nib.value;
				});
				lastToken = token;
			} else {
				lastLoc = null;
				lastToken = null;
			}
		}

		var lastGoodToken = -1;
		function writeNode(node) {

			throw new Error(" this needs work!! ");

			if (node.startToken === undefined) {
				if (lastGoodToken > -1) {
					while (tokenIndex < lastGoodToken) {
						writeToken(tokenList[tokenIndex++]);
					}
				}
				prettyPrint(node);
				lastToken = null;
				return;
			}
			lastGoodToken = node.startToken;

			switch (node.type) {
				case "object":
					node.children.forEach(function (node) {
						writeNode(node.key);
						writeNode(node.value);
					});
					break;

				case "array":
					node.children.forEach(writeNode);
					break;

				default:
					while (node.start) {
						writeToken(node.startToken);
					}}
		}

		writeNode(ast);

		return output;
	}

	function astToObject(ast, settings) {
		var result;

		function writeNode(node) {
			switch (node.type) {
				case "object":
					result = {};
					node.children.forEach(function (child, index) {
						result[child.key.value] = writeNode(child.value);
					});
					break;

				case "array":
					result = [];
					node.children.forEach(function (child, index) {
						result.push(writeNode(child.value));
					});
					break;

				case "literal":
					result = node.value;
					break;

				default:
					throw new Error("Unexpected node type '" + node.type + "'");
			}
		}

		writeNode(ast);

		return result;
	}

	function objectToAst(object, ast) {

		var tokenList = ast && ast.tokenList || null;

		function isArray(value) {
			return value !== null && (value instanceof Array || Object.prototype.toString.call(value) === "[object Array]");
		}

		function isPlainObject(obj) {
			if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null) {
				var proto = Object.getPrototypeOf(obj);
				return proto === Object.prototype || proto === null;
			}

			return false;
		}

		function deleteNode(node) {
			if (node && tokenList) {
				if (node.startToken) {
					delete tokenList[node.startToken];
					delete node.startToken;
				}
				if (node.children) node.children.forEach(deleteNode);
			}
		}

		function mergeIntoAst(object, ast) {
			if (isArray(object)) {
				if (ast === null || ast.type !== "array") {
					deleteNode(ast);
					ast = createArray();
				}
				var lookup = {};
				object.forEach(function (value, index) {
					lookup[index] = value;
				});
				for (var index = 0; index < ast.children.length; index++) {
					var child = ast.children[index];
					var match = lookup[index];
					if (match !== undefined) {
						delete lookup[index];
						mergeIntoAst(match, child.value);
					} else {
						deleteNode(child);
						ast.children.splice(index--, 1);
					}
				}
				for (var name in lookup) {
					var node = mergeIntoAst(lookup[name], null);
					ast.children.push(node);
				}
			} else if (isPlainObject(object)) {
				if (ast === null || ast.type != "object") {
					deleteNode(ast);
					ast = createObject();
				}
				var lookup = {};
				for (var name in object) {
					lookup[name] = object[name];
				}for (var index = 0; index < ast.children.length; index++) {
					var child = ast.children[index];
					var key = child.key.value;
					var match = lookup[key];
					if (match !== undefined) {
						delete lookup[key];
						mergeIntoAst(match, child.value);
					} else {
						deleteNode(child);
						ast.children.splice(index--, 1);
					}
				}
				for (var name in lookup) {
					var node = mergeIntoAst(lookup[name], null);
					ast.children.push(createObjectProperty(createObjectKey(name), node));
				}
			} else {
				if (ast !== null && ast.type !== "literal") {
					deleteNode(ast);
					ast = null;
				}
				if (ast === null || object !== ast.value) {
					deleteNode(ast);
					ast = createLiteral(object, "" + object);
				}
			}

			return ast;
		}

		return mergeIntoAst(object, ast || null);
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

	function comment(value, name, token) {
		if (token.comments !== undefined) {
			var valueComments = value[name];
			if (valueComments === undefined) valueComments = value[name] = [];
			token.comments.forEach(function (comment) {
				valueComments.push({
					loc: comment.loc,
					source: comment.value
				});
			});
		}
	}

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
							if (settings.verbose) {
								object.startToken = index;
								comment(object, "leadingComments", token);
							}
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
								object.endToken = index;
								comment(object, "trailingComments", token);
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
								object.endToken = index;
								comment(object, "trailingComments", token);
							}
							return {
								value: object,
								index: index + 1
							};
						} else if (token.type === tokenTypes.COMMA) {
							comment(object.children[object.children.length - 1], "trailingComments", token);
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
								key.startToken = index;
								comment(key, "leadingComments", token);
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
							if (settings.verbose) {
								if (token.comments) comment(property.key, "trailingComments", token);
								property.colonToken = token;
							}
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
							if (settings.verbose) {
								array.startToken = index;
								comment(array, "leadingComments", token);
							}
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
								array.endToken = index;
								comment(array, "trailingComments", token);
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
								array.endToken = index;
								comment(array, "trailingComments", token);
							}
							index++;
							return {
								value: array,
								index: index
							};
						} else if (token.type === tokenTypes.COMMA) {
							comment(array.children[array.children.length - 1], "trailingComments", token);
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
				literal.startToken = index;
				comment(literal, "leadingComments", token);
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

	function parseToAst(input, settings) {
		settings = _extends({}, defaultSettings, settings);
		var tokenList = tokenize(input, settings);

		if (tokenList.length === 0) {
			error(parseErrorTypes.unexpectedEnd());
		}

		var value = parseValue(input, tokenList, 0, settings);

		if (value.index === tokenList.length) {
			var result = value.value;
			if (settings.verbose) {
				result.tokenList = tokenList;
			}
			return result;
		} else {
			var token = tokenList[value.index];
			error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
		}
	}

	function defaultFunction(input, settings) {
		return parseToAst(input, settings);
	}

	defaultFunction.parseToAst = parseToAst;
	defaultFunction.astToObject = astToObject;
	defaultFunction.objectToAst = objectToAst;
	defaultFunction.prettyPrint = prettyPrint;
	defaultFunction.rewrite = rewrite;

	module.exports = defaultFunction;
});