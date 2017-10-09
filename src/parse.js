import location from './location';
import error from './error';
import parseErrorTypes from './parseErrorTypes';
import {tokenize, tokenTypes} from './tokenize';

const literals = [
	tokenTypes.STRING,
	tokenTypes.NUMBER,
	tokenTypes.TRUE,
	tokenTypes.FALSE,
	tokenTypes.NULL
];

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
	verbose: true,
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

function parseObject(input, tokenList, index, settings) {
	// object: LEFT_BRACE (property (COMMA property)*)? RIGHT_BRACE
	let startToken;
	let object = {
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
					if (settings.verbose) {
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
					if (settings.verbose) {
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
							input.substring(token.loc.start.offset, token.loc.end.offset),
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
							input.substring(token.loc.start.offset, token.loc.end.offset),
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
	let property = {
		type: 'Property',
		key: null,
		value: null
	};
	let state = objectStates._START_;

	while (index < tokenList.length) {
		const token = tokenList[index];

		switch (state) {
			case propertyStates._START_: {
				if (token.type === tokenTypes.STRING) {
					const key = {
						type: 'Identifier',
						value: token.value
					};
					if (settings.verbose) {
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
							input.substring(token.loc.start.offset, token.loc.end.offset),
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
				if (settings.verbose) {
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
	let array = {
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
					if (settings.verbose) {
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
					let value = parseValue(input, tokenList, index, settings);
					index = value.index;
					array.children.push(value.value);
					state = arrayStates.VALUE;
				}
				break;
			}

			case arrayStates.VALUE: {
				if (token.type === tokenTypes.RIGHT_BRACKET) {
					if (settings.verbose) {
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
					index ++;
					return {
						value: array,
						index
					};
				} else if (token.type === tokenTypes.COMMA) {
					state = arrayStates.COMMA;
					index ++;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							input.substring(token.loc.start.offset, token.loc.end.offset),
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
				let value = parseValue(input, tokenList, index, settings);
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

	const isLiteral = literals.indexOf(token.type) !== -1;

	if (isLiteral) {
		const literal = {
			type: 'Literal',
			value: token.value,
			rawValue: input.substring(token.loc.start.offset, token.loc.end.offset)
		};
		if (settings.verbose) {
			literal.loc = token.loc;
		}
		return {
			value: literal,
			index: index + 1
		}
	}

	return null;
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
				input.substring(token.loc.start.offset, token.loc.end.offset),
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
	} else {
		const token = tokenList[value.index];
		error(
			parseErrorTypes.unexpectedToken(
				input.substring(token.loc.start.offset, token.loc.end.offset),
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
