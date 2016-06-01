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
	START_QUOTE_OR_CHAR: 1
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

const errors = {
	tokenizeSymbol(char, line, column) {
		throw new Error(`Cannot tokenize symbol <${char}> at ${line}:${column}`)
	}
};

// HELPERS

function isDigit1to9(char) {
	return char >= '1' && char <= '9';
}

function isDigit(char) {
	return char >= '0' && char <= '9';
}

function isHex(char) {
	return isDigit(char)
		|| (char >= 'a' && char <= 'f')
		|| (char >= 'A' && char <= 'F');
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
			index: index + matched.length,
			value: null
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
					buffer += char;
					index ++;
					let nextChar = source.charAt(index);
					if (nextChar in escapes) {
						buffer += nextChar;
						index ++;
						if (nextChar === 'u') {
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
					} else {
						return null;
					}
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
			case numberStates._START_:
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

			case numberStates.MINUS:
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

			case numberStates.ZERO:
				if (char === '.') {
					state = numberStates.POINT;
				} else if (isExp(char)) {
					state = numberStates.EXP;
				} else {
					break iterator;
				}
				break;

			case numberStates.DIGIT:
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

			case numberStates.POINT:
				if (isDigit(char)) {
					passedValueIndex = index + 1;
					state = numberStates.DIGIT_FRACTION;
				} else {
					break iterator;
				}
				break;

			case numberStates.DIGIT_FRACTION:
				if (isDigit(char)) {
					passedValueIndex = index + 1;
				} else if (isExp(char)) {
					state = numberStates.EXP;
				} else {
					break iterator;
				}
				break;

			case numberStates.EXP:
				if (char === '+' || char === '-') {
					state = numberStates.EXP_DIGIT_OR_SIGN;
				} else if (isDigit(char)) {
					passedValueIndex = index + 1;
					state = numberStates.EXP_DIGIT_OR_SIGN;
				} else {
					break iterator;
				}
				break;

			case numberStates.EXP_DIGIT_OR_SIGN:
				if (isDigit(char)) {
					passedValueIndex = index + 1;
				} else {
					break iterator;
				}
				break;
		}

		index ++;
	}

	if (passedValueIndex > 0) {
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

const defaultSettings = {
	verbose: true
};

export function tokenize (source, settings) {
	settings = Object.assign(defaultSettings, settings);
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
			let token = {
				type: matched.type,
				value: matched.value
			};

			if (settings.verbose) {
				token.position = position(line, column, index, matched.line, matched.column, matched.index);
			}

			tokens.push(token);
			index = matched.index;
			line = matched.line;
			column = matched.column;

		} else {
			errors.tokenizeSymbol(source.charAt(index), line.toString(), column.toString());

		}
	}

	return tokens;
}
