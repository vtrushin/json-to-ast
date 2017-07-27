import location from './location';

import error from './error';
import parseErrorTypes from './parseErrorTypes';
import {Tokenizer, tokenTypes} from './tokenize';

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

function comment(value, name, token) {
  if (token.comments !== undefined) {
    var valueComments = value[name];
    if (valueComments === undefined)
      valueComments = value[name] = [];
    token.comments.forEach(function(comment) {
      valueComments.push({
        loc: comment.loc,
        source: comment.value
      });
    });
  }
}

function parseObject(input, tokenizer, settings) {
	// object: LEFT_BRACE (property (COMMA property)*)? RIGHT_BRACE
	let startToken;
	let object = {
		type: 'object',
		children: []
	};
	let state = objectStates._START_;

	while (tokenizer.hasMore()) {
		const token = tokenizer.token();

		switch (state) {
			case objectStates._START_: {
				if (token.type === tokenTypes.LEFT_BRACE) {
					startToken = token;
					state = objectStates.OPEN_OBJECT;
					if (settings.verbose) {
					  object.startToken = tokenizer.tokenIndex;
					  comment(object, "leadingComments", token);
					}
					tokenizer.next();
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
						object.endToken = tokenizer.tokenIndex;
						comment(object, "trailingComments", token);
					}
					tokenizer.next();
					return {
						value: object
					};
				} else {
					const property = parseProperty(input, tokenizer, settings);
					object.children.push(property.value);
					state = objectStates.PROPERTY;
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
						object.endToken = tokenizer.tokenIndex;
						comment(object, "trailingComments", token);
					}
					tokenizer.next();
					return {
						value: object
					};
				} else if (token.type === tokenTypes.COMMA) {
					comment(object.children[object.children.length - 1], "trailingComments", token);
					state = objectStates.COMMA;
					tokenizer.next();
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							input.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						input,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case objectStates.COMMA: {
				const property = parseProperty(input, tokenizer, settings);
				if (property) {
					object.children.push(property.value);
					state = objectStates.PROPERTY;
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							input.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						input,
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

function parseProperty(input, tokenizer, settings) {
	// property: STRING COLON value
	let startToken;
	let property = {
		type: 'property',
		key: null,
		value: null
	};
	let state = objectStates._START_;

	while (tokenizer.hasMore()) {
		const token = tokenizer.token();

		switch (state) {
			case propertyStates._START_: {
				if (token.type === tokenTypes.STRING) {
					const key = {
						type: 'identifier',
						value: token.value
					};
					if (settings.verbose) {
						key.loc = token.loc;
						property.startToken = key.startToken = key.endToken = tokenizer.tokenIndex;
						comment(key, "leadingComments", token);
					}
					startToken = token;
					property.key = key;
					state = propertyStates.KEY;
					tokenizer.next();
				} else {
					return null;
				}
				break;
			}

			case propertyStates.KEY: {
				if (token.type === tokenTypes.COLON) {
					if (settings.verbose) {
					    comment(property.key, "trailingComments", token);
					    property.colonToken = token;
					}
					state = propertyStates.COLON;
					tokenizer.next();
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							input.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						input,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case propertyStates.COLON: {
				const value = parseValue(input, tokenizer, settings);
				property.value = value.value;
				if (settings.verbose) {
					property.endToken = value.value.endToken;
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
					value: property
				};
			}

		}
	}
}

function parseArray(input, tokenizer, settings) {
	// array: LEFT_BRACKET (value (COMMA value)*)? RIGHT_BRACKET
	let startToken;
	let array = {
		type: 'array',
		children: []
	};
	let state = arrayStates._START_;
	let token;

	while (tokenizer.hasMore()) {
		token = tokenizer.token();

		switch (state) {
			case arrayStates._START_: {
				if (token.type === tokenTypes.LEFT_BRACKET) {
					startToken = token;
					if (settings.verbose) {
					  array.startToken = tokenizer.tokenIndex;
					  comment(array, "leadingComments", token);
					}
					state = arrayStates.OPEN_ARRAY;
					tokenizer.next();
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
						array.endToken = tokenizer.tokenIndex;
						comment(array, "trailingComments", token);
					}
					tokenizer.next();
					return {
						value: array
					};
				} else {
					let value = parseValue(input, tokenizer, settings);
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
						array.endToken = tokenizer.tokenIndex;
						comment(array, "trailingComments", token);
					}
					tokenizer.next();
					return {
						value: array
					};
				} else if (token.type === tokenTypes.COMMA) {
					state = arrayStates.COMMA;
					tokenizer.next();
				} else {
					error(
						parseErrorTypes.unexpectedToken(
							input.substring(token.loc.start.offset, token.loc.end.offset),
							token.loc.start.line,
							token.loc.start.column
						),
						input,
						token.loc.start.line,
						token.loc.start.column
					);
				}
				break;
			}

			case arrayStates.COMMA: {
				let value = parseValue(input, tokenizer, settings);
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

function parseLiteral(input, tokenizer, settings) {
	// literal: STRING | NUMBER | TRUE | FALSE | NULL
	const token = tokenizer.token();

	const isLiteral = literals.indexOf(token.type) !== -1;

	if (isLiteral) {
		const literal = {
			type: 'literal',
			value: token.value,
			rawValue: input.substring(token.loc.start.offset, token.loc.end.offset)
		};
		if (settings.verbose) {
			literal.loc = token.loc;
			literal.startToken = literal.endToken = tokenizer.tokenIndex;
			comment(literal, "leadingComments", token);
		}
		tokenizer.next();
		return {
			value: literal
		}
	}

	return null;
}

function parseValue(input, tokenizer, settings) {
	// value: literal | object | array
	const token = tokenizer.token();

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
				token.loc.start.line,
				token.loc.start.column
			),
			input,
			token.loc.start.line,
			token.loc.start.column
		);
	}
}

function parseToAst(input, settings) {
  settings = Object.assign({}, defaultSettings, settings);
  const tokenizer = new Tokenizer(input, settings);
  tokenizer.tokenize();

  if (!tokenizer.hasMore()) {
    error(parseErrorTypes.unexpectedEnd());
  }

  const value = parseValue(input, tokenizer, settings);

  if (!tokenizer.hasMore()) {
    var result = value.value;
    if (settings.verbose) {
      result.tokenizer = tokenizer;
    }
    return result;
  } else {
    const token = tokenizer.next();
    error(
      parseErrorTypes.unexpectedToken(
        input.substring(token.loc.start.offset, token.loc.end.offset),
        token.loc.start.line,
        token.loc.start.column
      ),
      input,
      token.loc.start.line,
      token.loc.start.column
    );
  }
}

export default parseToAst;


