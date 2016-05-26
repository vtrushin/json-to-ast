import exceptionsDict from './exceptionsDict';
import position from './position';

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
	DIGIT_1TO9: 3,
	DIGIT_CEIL: 4,
	POINT: 5,
	DIGIT_FRACTION: 6,
	EXP: 7,
	EXP_PLUS: 8,
	EXP_MINUS: 9,
	EXP_DIGIT: 10
};

const isDigit1to9 = (char) =>  char >= '1' && char <= '9';
const isDigit = (char) => char >= '0' && char <= '9';
const isHex = (char) => isDigit(char) || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F');
const isExp = (char) => char === 'e' || char === 'E';
const isUnicode = (char) => char === 'u';

function parseWhitespace(source, index, line, column) {
	const char = source.charAt(index);

	if (char === '\r') { // CR (Unix)
		index ++;
		line ++;
		column = 1;
		if (source.charAt(index + 1) === '\n') { // CRLF (Windows)
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
		index: index,
		line: line,
		column: column
	};
}

function parseChar(source, index, line, column) {
	const char = source.charAt(index);

	if (char in charTokens) {
		return {
			type: charTokens[char],
			line: line,
			column: column + 1,
			index: index + 1
		};
	} else {
		return null;
	}
}

function parseKeyword(source, index, line, column) {
	const matched = Object.keys(keywordsTokens).find(name =>
		name === source.substr(index, name.length)
	);

	if (matched) {
		return {
			type: keywordsTokens[matched],
			line: line,
			column: column + matched.length,
			index: index + matched.length
		};
	} else {
		return null;
	}
}

function parseString(source, index, line, column) {
	const startIndex = index;
	let buffer = '';
	let state = stringStates._START_;

	while (index < source.length) {
		const char = source.charAt(index);

		switch (state) {
			case stringStates._START_:
				if (char === '"') {
					state = stringStates.START_QUOTE_OR_CHAR;
					index ++;
				} else {
					return null;
				}
				break;

			case stringStates.START_QUOTE_OR_CHAR:
				if (char === '\\') {
					state = stringStates.ESCAPE;
					buffer += char;
					index ++;
				} else if (char === '"') {
					index ++;
					return {
						type: tokenTypes.STRING,
						value: buffer,
						line: line,
						index: index,
						column: column + index - startIndex
					};
				} else {
					buffer += char;
					index ++;
				}
				break;

			case stringStates.ESCAPE:
				if (char in escapes) {
					buffer += char;
					index ++;
					if (isUnicode(char)) {
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

function parseNumber(source, index, line, column) {
	const startIndex = index;
	let passedValueIndex = index;
	let state = numberStates._START_;

	iterator: while (index < source.length) {
		const char = source.charAt(index);
		index ++;

		switch (state) {
			case numberStates._START_:
				if (char === '-') {
					state = numberStates.MINUS;
				} else if (char === '0') {
					state = numberStates.ZERO;
					passedValueIndex = index;
				} else if (isDigit1to9(char)) {
					state = numberStates.DIGIT_1TO9;
					passedValueIndex = index;
				} else {
					return null;
				}
				break;

			case numberStates.MINUS:
				if (char === '0') {
					state = numberStates.ZERO;
					passedValueIndex = index;
				} else if (isDigit1to9(char)) {
					state = numberStates.DIGIT_1TO9;
					passedValueIndex = index;
				} else {
					return null;
				}
				break;

			case numberStates.ZERO:
				if (char === '.') {
					state = numberStates.POINT;
				} else if (isExp(char)) {
					state = numberStates.EXP;
				} else {
					break iterator;
				}
				break;

			case numberStates.DIGIT_1TO9:
			case numberStates.DIGIT_CEIL:
				if (isDigit(char)) {
					state = numberStates.DIGIT_CEIL;
					passedValueIndex = index;
				} else if (char === '.') {
					state = numberStates.POINT;
				} else if (isExp(char)) {
					state = numberStates.EXP;
				} else {
					break iterator;
				}
				break;

			case numberStates.POINT:
				if (isDigit(char)) {
					state = numberStates.DIGIT_FRACTION;
					passedValueIndex = index;
				} else {
					break iterator;
				}
				break;

			case numberStates.DIGIT_FRACTION:
				if (isDigit(char)) {
					passedValueIndex = index;
				} else if (isExp(char)) {
					state = numberStates.EXP;
				} else {
					break iterator;
				}
				break;

			case numberStates.EXP:
				if (char === '+') {
					state = numberStates.EXP_PLUS;
				} else if (char === '-') {
					state = numberStates.EXP_MINUS;
				} else if (isDigit(char)) {
					state = numberStates.EXP_DIGIT;
					passedValueIndex = index;
				} else {
					break iterator;
				}
				break;

			case numberStates.EXP_PLUS:
			case numberStates.EXP_MINUS:
			case numberStates.EXP_DIGIT:
				if (isDigit(char)) {
					state = numberStates.EXP_DIGIT;
					passedValueIndex = index;
				} else {
					break iterator;
				}
				break;
		}
	}

	if (passedValueIndex > startIndex) {
		return {
			type: tokenTypes.NUMBER,
			value: source.substring(startIndex, passedValueIndex),
			line: line,
			index: passedValueIndex,
			column: column + passedValueIndex - startIndex
		};
	} else {
		return null;
	}
}

export function tokenize (source) {
	let line = 1;
	let column = 1;
	let index = 0;
	let tokens = [];

	while (index < source.length) {
		let whitespace = parseWhitespace(source, index, line, column);

		if (whitespace) {
			index = whitespace.index;
			line = whitespace.line;
			column = whitespace.column;
			continue;
		}

		let matched =
			parseChar(source, index, line, column) ||
			parseKeyword(source, index, line, column) ||
			parseString(source, index, line, column) ||
			parseNumber(source, index, line, column);

		if (matched) {
			tokens.push({
				type: matched.type,
				value: matched.value,
				position: position(line, column, index, matched.line, matched.column, matched.index)
			});
			index = matched.index;
			line = matched.line;
			column = matched.column;

		} else {
			throw new SyntaxError(
				exceptionsDict.tokenizeSymbolError
					.replace('{char}', source.charAt(index))
					.replace('{line}', line.toString())
					.replace('{column}', column.toString())
			);
		}
	}

	return tokens;
}
