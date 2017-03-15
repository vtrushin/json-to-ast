import location from './location';
import error from './error';
import parseErrorTypes from './parseErrorTypes';
import {tokenize, tokenTypes} from './tokenize';

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
	fileName: null
};

function parseObject(source, tokenList, index, settings) {
	let startToken;
	let object = {
		type: 'object',
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
							settings.fileName
						);
						return {
							value: object,
							index: index + 1
						};
					}
				} else {
					const property = parseProperty(source, tokenList, index, settings);
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
							settings.fileName
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
							source.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case objectStates.COMMA: {
				const property = parseProperty(source, tokenList, index, settings);
				if (property) {
					index = property.index;
					object.children.push(property.value);
					state = objectStates.PROPERTY;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							source.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}
		}
	}

	error(parseErrorTypes.unexpectedEnd());
}

function parseProperty(source, tokenList, index, settings) {
	let startToken;
	let property = {
		type: 'property',
		children: []
	};
	let state = objectStates._START_;

	while (index < tokenList.length) {
		const token = tokenList[index];

		switch (state) {
			case propertyStates._START_: {
				if (token.type === tokenTypes.STRING) {
					const key = {
						type: 'key',
						value: token.value
					};
					if (settings.verbose) {
						key.loc = token.loc;
					}
					startToken = token;
					property.children.push(key);
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
							source.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case propertyStates.COLON: {
				const value = parseValue(source, tokenList, index, settings);
				property.children.push(value.value);
				property.loc = location(
					startToken.loc.start.line,
					startToken.loc.start.column,
					startToken.loc.start.offset,
					value.value.loc.end.line,
					value.value.loc.end.column,
					value.value.loc.end.offset,
					settings.fileName
				);
				return {
					value: property,
					index: value.index
				};
			}

		}
	}
}

function parseArray(source, tokenList, index, settings) {
	let startToken;
	let array = {
		type: 'array',
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
							settings.fileName
						);
					}
					return {
						value: array,
						index: index + 1
					};
				} else {
					let value = parseValue(source, tokenList, index, settings);
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
							settings.fileName
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
							source.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						source,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case arrayStates.COMMA: {
				let value = parseValue(source, tokenList, index, settings);
				index = value.index;
				array.children.push(value.value);
				state = arrayStates.VALUE;
				break;
			}
		}
	}

	error(
		parseErrorTypes.unexpectedEnd()
	);
}

function parseValue(source, tokenList, index, settings) {
	// value: object | array | STRING | NUMBER | TRUE | FALSE | NULL
	let token = tokenList[index];
	let value;
	let rawValue;

	switch (token.type) {
		case tokenTypes.STRING:
			value = 'string';
			break;
		case tokenTypes.NUMBER:
			value = 'number';
			break;
		case tokenTypes.TRUE:
			value = 'true';
			break;
		case tokenTypes.FALSE:
			value = 'false';
			break;
		case tokenTypes.NULL:
			value = 'null';
	}

	if (value) {
		let valueObject = {
			type: 'value',
			value: token.value
		};
		if (settings.verbose) {
			valueObject.loc = token.loc;
		}
		return {
			value: valueObject,
			index: index + 1
		}

	} else {
		const objectOrValue = (
			parseObject(...arguments)
			|| parseArray(...arguments)
		);

		if (objectOrValue) {
			return objectOrValue;
		} else {
			error(
				parseErrorTypes.unexpectedToken(
					source.substring(token.loc.start.offset, token.loc.end.offset),
					token.loc.start.line,
					token.loc.start.column
				),
				source,
				token.loc.start.line,
				token.loc.start.column
			);
		}
	}
}

export default (source, settings) => {
	settings = Object.assign({}, defaultSettings, settings);
	const tokenList = tokenize(source, settings);

	if (tokenList.length === 0) {
		error(parseErrorTypes.unexpectedEnd());
	}

	const value = parseValue(source, tokenList, 0, settings);

	if (value.index === tokenList.length) {
		return value.value;
	} else {
		const token = tokenList[value.index];
		error(
			parseErrorTypes.unexpectedToken(
				source.substring(token.loc.start.offset, token.loc.end.offset),
				token.loc.start.line,
				token.loc.start.column
			),
			source,
			token.loc.start.line,
			token.loc.start.column
		);
	}
}
