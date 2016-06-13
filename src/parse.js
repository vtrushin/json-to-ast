import {error} from './error';
import {tokenize, tokenTypes} from './tokenize';
import exceptionsDict from './exceptionsDict';
import position from './position';

const objectStates = {
	_START_: 0,
	OPEN_OBJECT: 1,
	KEY: 2,
	COLON: 3,
	VALUE: 4,
	COMMA: 5
};

const arrayStates = {
	_START_: 0,
	OPEN_ARRAY: 1,
	VALUE: 2,
	COMMA: 3
};

const defaultSettings = {
	verbose: true
};

const primitiveTokenTypes = {
	'string': tokenTypes.STRING,
	'number': tokenTypes.NUMBER,
	'true': tokenTypes.TRUE,
	'false': tokenTypes.FALSE,
	'null': tokenTypes.NULL
};

const errors = {
	emptyString: 'JSON is empty'
};

function parseObject(tokenList, index, settings) {
	let startToken;
	let property;
	let object = {
		type: 'object',
		properties: []
	};
	let state = objectStates._START_;

	while (index < tokenList.length) {
		const token = tokenList[index];

		switch (state) {
			case objectStates._START_:
				if (token.type === tokenTypes.LEFT_BRACE) {
					startToken = token;
					state = objectStates.OPEN_OBJECT;
					index ++;
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
					index ++;
				} else if (token.type === tokenTypes.RIGHT_BRACE) {
					if (settings.verbose) {
						object.position = position(
							startToken.position.start.line,
							startToken.position.start.column,
							startToken.position.start.char,
							token.position.end.line,
							token.position.end.column,
							token.position.end.char
						);
					}
					index ++;
					return {
						value: object,
						index: index
					};
				} else {
					return null;
				}
				break;

			case objectStates.KEY:
				if (token.type === tokenTypes.COLON) {
					state = objectStates.COLON;
					index ++;
				} else {
					return null;
				}
				break;

			case objectStates.COLON:
				let value = parseValue(tokenList, index, settings);
				index = value.index;
				if (value !== null) {
					property.value = value.value;
					object.properties.push(property);
					state = objectStates.VALUE;
				} else {
					return null;
				}
				break;

			case objectStates.VALUE:
				if (token.type === tokenTypes.RIGHT_BRACE) {
					if (settings.verbose) {
						object.position = position(
							startToken.position.start.line,
							startToken.position.start.column,
							startToken.position.start.char,
							token.position.end.line,
							token.position.end.column,
							token.position.end.char
						);
					}
					index ++;
					return {
						value: object,
						index: index
					};
				} else if (token.type === tokenTypes.COMMA) {
					state = objectStates.COMMA;
					index ++;
				} else {
					return null;
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
					index ++;
				} else {
					return null;
				}
				break;
		}

	}

}

function parseArray(tokenList, index, settings) {
	let startToken;
	let value;
	let array = {
		type: 'array',
		items: []
	};
	let state = arrayStates._START_;

	while (index < tokenList.length) {
		const token = tokenList[index];

		switch (state) {
			case arrayStates._START_:
				if (token.type === tokenTypes.LEFT_BRACKET) {
					startToken = token;
					state = arrayStates.OPEN_ARRAY;
					index ++;
				} else {
					return null;
				}
				break;

			case arrayStates.OPEN_ARRAY:
				if (token.type === tokenTypes.RIGHT_BRACKET) {
					if (settings.verbose) {
						array.position = position(
							startToken.position.start.line,
							startToken.position.start.column,
							startToken.position.start.char,
							token.position.end.line,
							token.position.end.column,
							token.position.end.char
						);
					}
					index ++;
					return {
						value: array,
						index: index
					};
				} else {
					value = parseValue(tokenList, index, settings);
					index = value.index;
					if (value !== null) {
						array.items.push(value.value);
						state = arrayStates.VALUE;
					} else {
						return null;
					}

				}
				break;

			case arrayStates.VALUE:
				if (token.type === tokenTypes.RIGHT_BRACKET) {
					if (settings.verbose) {
						array.position = position(
							startToken.position.start.line,
							startToken.position.start.column,
							startToken.position.start.char,
							token.position.end.line,
							token.position.end.column,
							token.position.end.char
						);
					}
					index ++;
					return {
						value: array,
						index: index
					};
				} else if (token.type === tokenTypes.COMMA) {
					state = arrayStates.COMMA;
					index ++;
				} else {
					return null;
				}
				break;

			case arrayStates.COMMA:
				value = parseValue(tokenList, index, settings);
				index = value.index;
				if (value !== null) {
					array.items.push(value.value);
					state = arrayStates.VALUE;
				} else {
					return null;
				}
				break;
		}
	}
}

function parseValue(tokenList, index, settings) {
	// value: object | array | STRING | NUMBER | TRUE | FALSE | NULL
	let token = tokenList[index];
	let tokenType;

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
		index ++;
		let value = {
			type: tokenType,
			value: token.value
		};
		if (settings.verbose) {
			value.position = token.position;
		}
		return {
			value: value,
			index: index
		}

	} else {
		let objectOrArray = parseObject(tokenList, index, settings) || parseArray(tokenList, index, settings);

		if (objectOrArray !== null) {
			return objectOrArray;
		} else {
			error('!!!!!');
		}

	}
}

export default function(source, settings) {
	settings = Object.assign({}, defaultSettings, settings);
	const tokenList = tokenize(source, {
		verbose: settings.verbose
	});

	if (!tokenList.length) {
		error(errors.emptyString);
	}

	let json = parseValue(tokenList, 0, settings).value;

	if (json) {
		return json;
	} else {
		error('Unknown error');
	}
}
