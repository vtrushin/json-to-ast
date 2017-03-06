import position from './position';
import error from './error';
import parseErrorTypes from './parseErrorTypes';
import {tokenize, tokenTypes} from './tokenize';

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

function parseObject(source, tokenList, index, settings) {
	let startToken;
	let property;
	let object = {
		type: 'object',
		properties: []
	};
	let state = objectStates._START_;
	let token;

	while (index < tokenList.length) {
		token = tokenList[index];

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
							startToken.position.start.offset,
							token.position.end.line,
							token.position.end.column,
							token.position.end.offset
						);
					}
					index ++;
					return {
						value: object,
						index
					};
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							source.substring(token.position.start.offset, token.position.end.offset),
							token.position.start.line,
							token.position.start.column
						),
						source,
						token.position.start.line,
						token.position.start.column
					);
				}
				break;

			case objectStates.KEY:
				if (token.type === tokenTypes.COLON) {
					state = objectStates.COLON;
					index ++;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							source.substring(token.position.start.offset, token.position.end.offset),
							token.position.start.line,
							token.position.start.column
						),
						source,
						token.position.start.line,
						token.position.start.column
					);
				}
				break;

			case objectStates.COLON:
				let value = parseValue(source, tokenList, index, settings);
				index = value.index;
				property.value = value.value;
				object.properties.push(property);
				state = objectStates.VALUE;
				break;

			case objectStates.VALUE:
				if (token.type === tokenTypes.RIGHT_BRACE) {
					if (settings.verbose) {
						object.position = position(
							startToken.position.start.line,
							startToken.position.start.column,
							startToken.position.start.offset,
							token.position.end.line,
							token.position.end.column,
							token.position.end.offset
						);
					}
					index ++;
					return {
						value: object,
						index
					};
				} else if (token.type === tokenTypes.COMMA) {
					state = objectStates.COMMA;
					index ++;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							source.substring(token.position.start.offset, token.position.end.offset),
							token.position.start.line,
							token.position.start.column
						),
						source,
						token.position.start.line,
						token.position.start.column
					);
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
						property.key.position = token.position;
					}
					state = objectStates.KEY;
					index ++;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							source.substring(token.position.start.offset, token.position.end.offset),
							token.position.start.line,
							token.position.start.column
						),
						source,
						token.position.start.line,
						token.position.start.column
					);
				}
				break;
		}

	}

	error(
		parseErrorTypes.unexpectedEnd()
	);

}

function parseArray(source, tokenList, index, settings) {
	let startToken;
	let array = {
		type: 'array',
		items: []
	};
	let state = arrayStates._START_;
	let token;

	while (index < tokenList.length) {
		token = tokenList[index];

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
							startToken.position.start.offset,
							token.position.end.line,
							token.position.end.column,
							token.position.end.offset
						);
					}
					index ++;
					return {
						value: array,
						index
					};
				} else {
					let value = parseValue(source, tokenList, index, settings);
					index = value.index;
					array.items.push(value.value);
					state = arrayStates.VALUE;
				}
				break;

			case arrayStates.VALUE:
				if (token.type === tokenTypes.RIGHT_BRACKET) {
					if (settings.verbose) {
						array.position = position(
							startToken.position.start.line,
							startToken.position.start.column,
							startToken.position.start.offset,
							token.position.end.line,
							token.position.end.column,
							token.position.end.offset
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
							source.substring(token.position.start.offset, token.position.end.offset),
							token.position.start.line,
							token.position.start.column
						),
						source,
						token.position.start.line,
						token.position.start.column
					);
				}
				break;

			case arrayStates.COMMA:
				let value = parseValue(source, tokenList, index, settings);
				index = value.index;
				array.items.push(value.value);
				state = arrayStates.VALUE;
				break;
		}
	}

	error(
		parseErrorTypes.unexpectedEnd()
	);
}

function parseValue(source, tokenList, index, settings) {
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
			value,
			index
		}

	} else {
		const objectOrValue = (
			parseObject(source, tokenList, index, settings)
			|| parseArray(source, tokenList, index, settings)
		);

		if (objectOrValue) {
			return objectOrValue;
		} else {
			error(
				parseErrorTypes.unexpectedToken(
					source.substring(token.position.start.offset, token.position.end.offset),
					token.position.start.line,
					token.position.start.column
				),
				source,
				token.position.start.line,
				token.position.start.column
			);
		}
	}
}

export default (source, settings) => {
	settings = Object.assign({}, defaultSettings, settings);
	const tokenList = tokenize(source);

	if (tokenList.length === 0) {
		error(
			parseErrorTypes.unexpectedEnd()
		);
	}

	const value = parseValue(source, tokenList, 0, settings);

	if (value.index === tokenList.length) {
		return value.value;
	} else {
		const token = tokenList[value.index];
		error(
			parseErrorTypes.unexpectedToken(
				source.substring(token.position.start.offset, token.position.end.offset),
				token.position.start.line,
				token.position.start.column
			),
			source,
			token.position.start.line,
			token.position.start.column
		);
	}
}
