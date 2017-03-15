import location from './location';
import error from './error';
import tokenizeErrorTypes from './tokenizeErrorTypes';

export const tokenTypes = {
	LEFT_BRACE: 'LEFT_BRACE',       // {
	RIGHT_BRACE: 'RIGHT_BRACE',     // }
	LEFT_BRACKET: 'LEFT_BRACKET',   // [
	RIGHT_BRACKET: 'RIGHT_BRACKET', // ]
	COLON: 'COLON',                 // :
	COMMA: 'COMMA',                 // ,
	STRING: 'STRING',               //
	NUMBER: 'NUMBER',               //
	TRUE: 'TRUE',                   // true
	FALSE: 'FALSE',                 // false
	NULL: 'NULL'                    // null
};

const charTokens = {
	'{': tokenTypes.LEFT_BRACE,
	'}': tokenTypes.RIGHT_BRACE,
	'[': tokenTypes.LEFT_BRACKET,
	']': tokenTypes.RIGHT_BRACKET,
	':': tokenTypes.COLON,
	',': tokenTypes.COMMA
};

const keywordsTokens = {
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

function parseWhitespace(source, index, line, column) {
	const char = source.charAt(index);

	if (char === '\r') { // CR (Unix)
		index ++;
		line ++;
		column = 1;
		if (source.charAt(index) === '\n') { // CRLF (Windows)
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

function parseChar(source, index, line, column) {
	const char = source.charAt(index);

	if (char in charTokens) {
		return {
			type: charTokens[char],
			line,
			column: column + 1,
			index: index + 1
		};
	}

	return null;
}

function parseKeyword(source, index, line, column) {
	for (const name in keywordsTokens) {
		if (keywordsTokens.hasOwnProperty(name) && source.substr(index, name.length) === name) {
			return {
				type: keywordsTokens[name],
				line,
				column: column + name.length,
				index: index + name.length,
				value: null
			};
		}
	}

	return null;
}

function parseString(source, index, line, column) {
	const startIndex = index;
	let buffer = '';
	let state = stringStates._START_;

	while (index < source.length) {
		const char = source.charAt(index);

		switch (state) {
			case stringStates._START_: {
				if (char === '"') {
					state = stringStates.START_QUOTE_OR_CHAR;
					index ++;
				} else {
					return null;
				}
				break;
			}

			case stringStates.START_QUOTE_OR_CHAR: {
				if (char === '\\') {
					state = stringStates.ESCAPE;
					buffer += char;
					index ++;
				} else if (char === '"') {
					index ++;
					return {
						type: tokenTypes.STRING,
						value: buffer,
						line,
						index,
						column: column + index - startIndex
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
							let curChar = source.charAt(index);
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

function parseNumber(source, index, line, column) {
	const startIndex = index;
	let passedValueIndex = index;
	let state = numberStates._START_;

	iterator: while (index < source.length) {
		let char = source.charAt(index);

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
			value: source.substring(startIndex, passedValueIndex),
			line,
			index: passedValueIndex,
			column: column + passedValueIndex - startIndex
		};
	}

	return null;
}

/*const defaultSettings = {
	verbose: true,
	fileName: null
};*/

export function tokenize(source, settings) {
	/*settings = Object.assign({}, defaultSettings, settings);*/
	let line = 1;
	let column = 1;
	let index = 0;
	const tokens = [];

	while (index < source.length) {
		const args = [source, index, line, column];
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
			let token = {
				type: matched.type,
				value: matched.value,
				loc: location(
					line,
					column,
					index,
					matched.line,
					matched.column,
					matched.index,
					settings.fileName
				)
			};

			tokens.push(token);
			index = matched.index;
			line = matched.line;
			column = matched.column;

		} else {
			error(
				tokenizeErrorTypes.cannotTokenizeSymbol(source.charAt(index), line, column),
				source,
				line,
				column
			);

		}
	}

	return tokens;
}
