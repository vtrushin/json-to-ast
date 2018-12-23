import substring from './utils/substring';
import location from './location';
import error from './error';
import parseErrorTypes from './parse-error-types';
import tokenize, { tokenTypes } from './tokenize';

const objectStates = {
	_START_: 0,
	OPEN_OBJECT: 1,
	PROPERTY: 2,
	COMMA: 3
};

const propertyStates = {
	_START_: 0,
	KEY: 1,
	COLON: 2
};

const arrayStates = {
	_START_: 0,
	OPEN_ARRAY: 1,
	VALUE: 2,
	COMMA: 3
};

const defaultSettings = {
	loc: true,
	source: null
};

function errorEof(input, tokenList, settings) {
	const loc = tokenList.length > 0
		? tokenList[tokenList.length - 1].loc.end
		: { line: 1, column: 1 };

	error(
		parseErrorTypes.unexpectedEnd(),
		input,
		settings.source,
		loc.line,
		loc.column
	);
}

/** @param hexCode {string} hexCode without '\u' prefix */
function parseHexEscape(hexCode) {
	let charCode = 0;

	for (let i = 0; i < 4; i ++) {
		charCode = charCode * 16 + parseInt(hexCode[i], 16);
	}

	return String.fromCharCode(charCode);
}

const escapes = {
	'b': '\b',	// Backspace
	'f': '\f',	// Form feed
	'n': '\n',	// New line
	'r': '\r',	// Carriage return
	't': '\t'	// Horizontal tab
};

const passEscapes = ['"', '\\', '/'];

function parseString(/** string */string) {
	let result = '';

	for (let i = 0; i < string.length; i ++) {
		const char = string.charAt(i);

		if (char === '\\') {
			i ++;
			const nextChar = string.charAt(i);
			if (nextChar === 'u') {
				result += parseHexEscape(string.substr(i + 1, 4));
				i += 4;
			} else if (passEscapes.indexOf(nextChar) !== -1) {
				result += nextChar;
			} else if (nextChar in escapes) {
				result += escapes[nextChar];
			} else {
				break;
			}
		} else {
			result += char;
		}
	}

	return result;
}

function parseObject(input, tokenList, index, settings) {
	// object: LEFT_BRACE (property (COMMA property)*)? RIGHT_BRACE
	let startToken;
	const object = {
		type: 'Object',
		children: []
	};
	let state = objectStates._START_;

	while (index < tokenList.length) {
		const token = tokenList[index];

		switch (state) {
			case objectStates._START_: {
				if (token.type === tokenTypes.LEFT_BRACE) {
					startToken = token;
					state = objectStates.OPEN_OBJECT;
					index ++;
				} else {
					return null;
				}
				break;
			}

			case objectStates.OPEN_OBJECT: {
				if (token.type === tokenTypes.RIGHT_BRACE) {
					if (settings.loc) {
						object.loc = location(
							startToken.loc.start.line,
							startToken.loc.start.column,
							startToken.loc.start.offset,
							token.loc.end.line,
							token.loc.end.column,
							token.loc.end.offset,
							settings.source
						);
					}
					return {
						value: object,
						index: index + 1
					};
				} else {
					const property = parseProperty(input, tokenList, index, settings);
					object.children.push(property.value);
					state = objectStates.PROPERTY;
					index = property.index;
				}
				break;
			}

			case objectStates.PROPERTY: {
				if (token.type === tokenTypes.RIGHT_BRACE) {
					if (settings.loc) {
						object.loc = location(
							startToken.loc.start.line,
							startToken.loc.start.column,
							startToken.loc.start.offset,
							token.loc.end.line,
							token.loc.end.column,
							token.loc.end.offset,
							settings.source
						);
					}
					return {
						value: object,
						index: index + 1
					};
				} else if (token.type === tokenTypes.COMMA) {
					state = objectStates.COMMA;
					index ++;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							substring(input, token.loc.start.offset, token.loc.end.offset),
							settings.source,
							token.loc.start.line,
							token.loc.start.column
						),
						input,
						settings.source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case objectStates.COMMA: {
				const property = parseProperty(input, tokenList, index, settings);
				if (property) {
					index = property.index;
					object.children.push(property.value);
					state = objectStates.PROPERTY;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							substring(input, token.loc.start.offset, token.loc.end.offset),
							settings.source,
							token.loc.start.line,
							token.loc.start.column
						),
						input,
						settings.source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}
		}
	}

	errorEof(input, tokenList, settings);
}

function parseProperty(input, tokenList, index, settings) {
	// property: STRING COLON value
	let startToken;
	const property = {
		type: 'Property',
		key: null,
		value: null
	};
	let state = propertyStates._START_;

	while (index < tokenList.length) {
		const token = tokenList[index];

		switch (state) {
			case propertyStates._START_: {
				if (token.type === tokenTypes.STRING) {
					const key = {
						type: 'Identifier',
						value: parseString(input.slice(token.loc.start.offset + 1, token.loc.end.offset - 1)),
						raw: token.value
					};
					if (settings.loc) {
						key.loc = token.loc;
					}
					startToken = token;
					property.key = key;
					state = propertyStates.KEY;
					index ++;
				} else {
					return null;
				}
				break;
			}

			case propertyStates.KEY: {
				if (token.type === tokenTypes.COLON) {
					state = propertyStates.COLON;
					index ++;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							substring(input, token.loc.start.offset, token.loc.end.offset),
							settings.source,
							token.loc.start.line,
							token.loc.start.column
						),
						input,
						settings.source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case propertyStates.COLON: {
				const value = parseValue(input, tokenList, index, settings);
				property.value = value.value;
				if (settings.loc) {
					property.loc = location(
						startToken.loc.start.line,
						startToken.loc.start.column,
						startToken.loc.start.offset,
						value.value.loc.end.line,
						value.value.loc.end.column,
						value.value.loc.end.offset,
						settings.source
					);
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
	let startToken;
	const array = {
		type: 'Array',
		children: []
	};
	let state = arrayStates._START_;
	let token;

	while (index < tokenList.length) {
		token = tokenList[index];

		switch (state) {
			case arrayStates._START_: {
				if (token.type === tokenTypes.LEFT_BRACKET) {
					startToken = token;
					state = arrayStates.OPEN_ARRAY;
					index ++;
				} else {
					return null;
				}
				break;
			}

			case arrayStates.OPEN_ARRAY: {
				if (token.type === tokenTypes.RIGHT_BRACKET) {
					if (settings.loc) {
						array.loc = location(
							startToken.loc.start.line,
							startToken.loc.start.column,
							startToken.loc.start.offset,
							token.loc.end.line,
							token.loc.end.column,
							token.loc.end.offset,
							settings.source
						);
					}
					return {
						value: array,
						index: index + 1
					};
				} else {
					const value = parseValue(input, tokenList, index, settings);
					index = value.index;
					array.children.push(value.value);
					state = arrayStates.VALUE;
				}
				break;
			}

			case arrayStates.VALUE: {
				if (token.type === tokenTypes.RIGHT_BRACKET) {
					if (settings.loc) {
						array.loc = location(
							startToken.loc.start.line,
							startToken.loc.start.column,
							startToken.loc.start.offset,
							token.loc.end.line,
							token.loc.end.column,
							token.loc.end.offset,
							settings.source
						);
					}
					return {
						value: array,
						index: index + 1
					};
				} else if (token.type === tokenTypes.COMMA) {
					state = arrayStates.COMMA;
					index ++;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							substring(input, token.loc.start.offset, token.loc.end.offset),
							settings.source,
							token.loc.start.line,
							token.loc.start.column
						),
						input,
						settings.source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case arrayStates.COMMA: {
				const value = parseValue(input, tokenList, index, settings);
				index = value.index;
				array.children.push(value.value);
				state = arrayStates.VALUE;
				break;
			}
		}
	}

	errorEof(input, tokenList, settings);
}

function parseLiteral(input, tokenList, index, settings) {
	// literal: STRING | NUMBER | TRUE | FALSE | NULL
	const token = tokenList[index];
	let value = null;

	switch (token.type) {
		case tokenTypes.STRING: {
			value = parseString(input.slice(token.loc.start.offset + 1, token.loc.end.offset - 1));
			break;
		}
		case tokenTypes.NUMBER: {
			value = Number(token.value);
			break;
		}
		case tokenTypes.TRUE: {
			value = true;
			break;
		}
		case tokenTypes.FALSE: {
			value = false;
			break;
		}
		case tokenTypes.NULL: {
			value = null;
			break;
		}
		default: {
			return null;
		}
	}

	const literal = {
		type: 'Literal',
		value,
		raw: token.value
	};
	if (settings.loc) {
		literal.loc = token.loc;
	}
	return {
		value: literal,
		index: index + 1
	}
}

function parseValue(input, tokenList, index, settings) {
	// value: literal | object | array
	const token = tokenList[index];

	const value = (
		parseLiteral(...arguments)
		|| parseObject(...arguments)
		|| parseArray(...arguments)
	);

	if (value) {
		return value;
	} else {
		error(
			parseErrorTypes.unexpectedToken(
				substring(input, token.loc.start.offset, token.loc.end.offset),
				settings.source,
				token.loc.start.line,
				token.loc.start.column
			),
			input,
			settings.source,
			token.loc.start.line,
			token.loc.start.column
		);
	}
}

export default (input, settings) => {
	settings = Object.assign({}, defaultSettings, settings);

	const tokenList = tokenize(input, settings);

	if (tokenList.length === 0) {
		errorEof(input, tokenList, settings);
	}

	const value = parseValue(input, tokenList, 0, settings);

	if (value.index === tokenList.length) {
		return value.value;
	}

	const token = tokenList[value.index];

	error(
		parseErrorTypes.unexpectedToken(
			substring(input, token.loc.start.offset, token.loc.end.offset),
			settings.source,
			token.loc.start.line,
			token.loc.start.column
		),
		input,
		settings.source,
		token.loc.start.line,
		token.loc.start.column
	);
}
