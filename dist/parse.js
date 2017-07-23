(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './location', './error', './parseErrorTypes', './tokenize'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./location'), require('./error'), require('./parseErrorTypes'), require('./tokenize'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.location, global.error, global.parseErrorTypes, global.tokenize);
		global.parse = mod.exports;
	}
})(this, function (exports, _location, _error, _parseErrorTypes, _tokenize) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _location2 = _interopRequireDefault(_location);

	var _error2 = _interopRequireDefault(_error);

	var _parseErrorTypes2 = _interopRequireDefault(_parseErrorTypes);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

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

	var literals = [_tokenize.tokenTypes.STRING, _tokenize.tokenTypes.NUMBER, _tokenize.tokenTypes.TRUE, _tokenize.tokenTypes.FALSE, _tokenize.tokenTypes.NULL];

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
						if (token.type === _tokenize.tokenTypes.LEFT_BRACE) {
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
						if (token.type === _tokenize.tokenTypes.RIGHT_BRACE) {
							if (settings.verbose) {
								object.loc = (0, _location2.default)(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
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
						if (token.type === _tokenize.tokenTypes.RIGHT_BRACE) {
							if (settings.verbose) {
								object.loc = (0, _location2.default)(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
								object.endToken = index;
								comment(object, "trailingComments", token);
							}
							return {
								value: object,
								index: index + 1
							};
						} else if (token.type === _tokenize.tokenTypes.COMMA) {
							comment(object.children[object.children.length - 1], "trailingComments", token);
							state = objectStates.COMMA;
							index++;
						} else {
							(0, _error2.default)(_parseErrorTypes2.default.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
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
							(0, _error2.default)(_parseErrorTypes2.default.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
						}
						break;
					}
			}
		}

		(0, _error2.default)(_parseErrorTypes2.default.unexpectedEnd());
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
						if (token.type === _tokenize.tokenTypes.STRING) {
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
						if (token.type === _tokenize.tokenTypes.COLON) {
							if (settings.verbose) {
								if (token.comments) comment(property.key, "trailingComments", token);
								property.colonToken = token;
							}
							state = propertyStates.COLON;
							index++;
						} else {
							(0, _error2.default)(_parseErrorTypes2.default.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
						}
						break;
					}

				case propertyStates.COLON:
					{
						var value = parseValue(input, tokenList, index, settings);
						property.value = value.value;
						if (settings.verbose) {
							property.loc = (0, _location2.default)(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, value.value.loc.end.line, value.value.loc.end.column, value.value.loc.end.offset, settings.source);
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
						if (token.type === _tokenize.tokenTypes.LEFT_BRACKET) {
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
						if (token.type === _tokenize.tokenTypes.RIGHT_BRACKET) {
							if (settings.verbose) {
								array.loc = (0, _location2.default)(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
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
						if (token.type === _tokenize.tokenTypes.RIGHT_BRACKET) {
							if (settings.verbose) {
								array.loc = (0, _location2.default)(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
								array.endToken = index;
								comment(array, "trailingComments", token);
							}
							index++;
							return {
								value: array,
								index: index
							};
						} else if (token.type === _tokenize.tokenTypes.COMMA) {
							comment(array.children[array.children.length - 1], "trailingComments", token);
							state = arrayStates.COMMA;
							index++;
						} else {
							(0, _error2.default)(_parseErrorTypes2.default.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
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

		(0, _error2.default)(_parseErrorTypes2.default.unexpectedEnd());
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
			(0, _error2.default)(_parseErrorTypes2.default.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
		}
	}

	function parseToAst(input, settings) {
		settings = _extends({}, defaultSettings, settings);
		var tokenList = (0, _tokenize.tokenize)(input, settings);

		if (tokenList.length === 0) {
			(0, _error2.default)(_parseErrorTypes2.default.unexpectedEnd());
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
			(0, _error2.default)(_parseErrorTypes2.default.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), token.loc.start.line, token.loc.start.column), input, token.loc.start.line, token.loc.start.column);
		}
	}

	exports.default = parseToAst;
});
//# sourceMappingURL=parse.js.map
