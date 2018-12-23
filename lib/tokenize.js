import substring from './utils/substring';
import location from './location';
import error from './error';
import tokenizeErrorTypes from './tokenize-error-types';

export const tokenTypes = {
	LEFT_BRACE: 0,		// {
	RIGHT_BRACE: 1,		// }
	LEFT_BRACKET: 2,	// [
	RIGHT_BRACKET: 3,	// ]
	COLON: 4,			// :
	COMMA: 5,			// ,
	STRING: 6,			//
	NUMBER: 7,			//
	TRUE: 8,			// true
	FALSE: 9,			// false
	NULL: 10			// null
};

const punctuatorTokensMap = { // Lexeme: Token
	'{': tokenTypes.LEFT_BRACE,
	'}': tokenTypes.RIGHT_BRACE,
	'[': tokenTypes.LEFT_BRACKET,
	']': tokenTypes.RIGHT_BRACKET,
	':': tokenTypes.COLON,
	',': tokenTypes.COMMA
};

const keywordTokensMap = { // Lexeme: Token
	'true': tokenTypes.TRUE,
	'false': tokenTypes.FALSE,
	'null': tokenTypes.NULL
};

const stringStates = {
	_START_: 0,
	START_QUOTE_OR_CHAR: 1,
	ESCAPE: 2
};

const escapes = {
	'"': 0,		// Quotation mask
	'\\': 1,	// Reverse solidus
	'/': 2,		// Solidus
	'b': 3,		// Backspace
	'f': 4,		// Form feed
	'n': 5,		// New line
	'r': 6,		// Carriage return
	't': 7,		// Horizontal tab
	'u': 8		// 4 hexadecimal digits
};

const numberStates = {
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
	return (
		isDigit(char)
		|| (char >= 'a' && char <= 'f')
		|| (char >= 'A' && char <= 'F')
	);
}

function isExp(char) {
	return char === 'e' || char === 'E';
}

// PARSERS

function parseWhitespace(input, index, line, column) {
	const char = input.charAt(index);

	if (char === '\r') { // CR (Unix)
		index ++;
		line ++;
		column = 1;
		if (input.charAt(index) === '\n') { // CRLF (Windows)
			index ++;
		}
	} else if (char === '\n') { // LF (MacOS)
		index ++;
		line ++;
		column = 1;
	} else if (char === '\t' || char === ' ') {
		index ++;
		column ++;
	} else {
		return null;
	}

	return {
		index,
		line,
		column
	};
}

function parseChar(input, index, line, column) {
	const char = input.charAt(index);

	if (char in punctuatorTokensMap) {
		return {
			type: punctuatorTokensMap[char],
			line,
			column: column + 1,
			index: index + 1,
			value: null
		};
	}

	return null;
}

function parseKeyword(input, index, line, column) {
	for (const name in keywordTokensMap) {
		if (keywordTokensMap.hasOwnProperty(name) && input.substr(index, name.length) === name) {
			return {
				type: keywordTokensMap[name],
				line,
				column: column + name.length,
				index: index + name.length,
				value: name
			};
		}
	}

	return null;
}

function parseString(input, index, line, column) {
	const startIndex = index;
	let buffer = '';
	let state = stringStates._START_;

	while (index < input.length) {
		const char = input.charAt(index);

		switch (state) {
			case stringStates._START_: {
				if (char === '"') {
					index ++;
					state = stringStates.START_QUOTE_OR_CHAR;
				} else {
					return null;
				}
				break;
			}

			case stringStates.START_QUOTE_OR_CHAR: {
				if (char === '\\') {
					buffer += char;
					index ++;
					state = stringStates.ESCAPE;
				} else if (char === '"') {
					index ++;
					return {
						type: tokenTypes.STRING,
						line,
						column: column + index - startIndex,
						index,
						value: input.slice(startIndex, index)
					};
				} else {
					buffer += char;
					index ++;
				}
				break;
			}

			case stringStates.ESCAPE: {
				if (char in escapes) {
					buffer += char;
					index ++;
					if (char === 'u') {
						for (let i = 0; i < 4; i ++) {
							const curChar = input.charAt(index);
							if (curChar && isHex(curChar)) {
								buffer += curChar;
								index ++;
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
	const startIndex = index;
	let passedValueIndex = index;
	let state = numberStates._START_;

	iterator: while (index < input.length) {
		const char = input.charAt(index);

		switch (state) {
			case numberStates._START_: {
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

			case numberStates.MINUS: {
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

			case numberStates.ZERO: {
				if (char === '.') {
					state = numberStates.POINT;
				} else if (isExp(char)) {
					state = numberStates.EXP;
				} else {
					break iterator;
				}
				break;
			}

			case numberStates.DIGIT: {
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

			case numberStates.POINT: {
				if (isDigit(char)) {
					passedValueIndex = index + 1;
					state = numberStates.DIGIT_FRACTION;
				} else {
					break iterator;
				}
				break;
			}

			case numberStates.DIGIT_FRACTION: {
				if (isDigit(char)) {
					passedValueIndex = index + 1;
				} else if (isExp(char)) {
					state = numberStates.EXP;
				} else {
					break iterator;
				}
				break;
			}

			case numberStates.EXP: {
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

			case numberStates.EXP_DIGIT_OR_SIGN: {
				if (isDigit(char)) {
					passedValueIndex = index + 1;
				} else {
					break iterator;
				}
				break;
			}
		}

		index ++;
	}

	if (passedValueIndex > 0) {
		return {
			type: tokenTypes.NUMBER,
			line,
			column: column + passedValueIndex - startIndex,
			index: passedValueIndex,
			value: input.slice(startIndex, passedValueIndex)
		};
	}

	return null;
}

const tokenize = (input, settings) => {
	let line = 1;
	let column = 1;
	let index = 0;
	const tokens = [];

	while (index < input.length) {
		const args = [input, index, line, column];
		const whitespace = parseWhitespace(...args);

		if (whitespace) {
			index = whitespace.index;
			line = whitespace.line;
			column = whitespace.column;
			continue;
		}

		const matched = (
			parseChar(...args)
			|| parseKeyword(...args)
			|| parseString(...args)
			|| parseNumber(...args)
		);

		if (matched) {
			const token = {
				type: matched.type,
				value: matched.value,
				loc: location(
					line,
					column,
					index,
					matched.line,
					matched.column,
					matched.index,
					settings.source
				)
			};

			tokens.push(token);
			index = matched.index;
			line = matched.line;
			column = matched.column;

		} else {
			error(
				tokenizeErrorTypes.unexpectedSymbol(
					substring(input, index, index + 1),
					settings.source,
					line,
					column
				),
				input,
				settings.source,
				line,
				column
			);

		}
	}

	return tokens;
};

export default tokenize;
