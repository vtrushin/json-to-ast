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

let isDigit1to9 = (char) =>  char >= '1' && char <= '9';
let isDigit = (char) => char >= '0' && char <= '9';
let isHex = (char) => isDigit(char) || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F');
let isExp = (char) => char === 'e' || char === 'E';
let isUnicode = (char) => char === 'u' || char === 'U';

export default function (source) {
	let line = 1;
	let column = 1;
	let index = 0;
	let currentToken = null;
	let currentValue = null;
	let tokens = [];

	while (index < source.length) {
		let _line = line;
		let _column = column;
		let _index = index;

		if (testWhitespace()) {
			continue;
		}

		let matched = testChar() || testKeyword() || testString() || testNumber();

		if (matched) {
			tokens.push({
				type: currentToken,
				value: currentValue,
				position: position(_line, _column, _index, line, column, index)
			});

			currentValue = null;

		} else {
			throw new SyntaxError(
				exceptionsDict.tokenizeSymbolError
					.replace('{char}', source.charAt(index))
					.replace('{line}', line.toString())
					.replace('{column}', column.toString())
			);
		}
	}

	function testWhitespace() {
		let char = source.charAt(index);

		if (source.charAt(index) === '\r' && source.charAt(index + 1) === '\n') { // CRLF (Windows)
			index += 2;
			line ++;
			column = 1;
			return true;
		} else if (char === '\r' || char === '\n') { // CR (Unix) or LF (MacOS)
			index ++;
			line ++;
			column = 1;
			return true;
		} else if (char === '\t' || char === ' ') {
			index ++;
			column ++;
			return true;
		} else {
			return false;
		}
	}

	function testChar() {
		let char = source.charAt(index);

		if (char in charTokens) {
			index ++;
			column ++;
			currentToken = charTokens[char];
			return true;
		} else {
			return false;
		}
	}

	function testKeyword() {
		let matched = Object.keys(keywordsTokens).find(name =>
			name === source.substr(index, name.length)
		);

		if (matched) {
			let length = matched.length;
			index += length;
			column += length;
			currentToken = keywordsTokens[matched];
			return true;
		} else {
			return false;
		}
	}

	function testString() {
		let buffer = '';
		let state = stringStates._START_;

		while (true) {
			let char = source.charAt(index);
			switch (state) {
				case stringStates._START_:
					if (char === '"') {
						state = stringStates.START_QUOTE_OR_CHAR;
						index ++;
					} else {
						return false;
					}
					break;

				case stringStates.START_QUOTE_OR_CHAR:
					if (char === '\\') {
						state = stringStates.ESCAPE;
						buffer += char;
						index ++;
					} else if (char === '"') {
						index ++;
						column += index - index;
						currentToken = tokenTypes.STRING;
						currentValue = buffer;
						return true;
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
									return false;
								}
							}
						}
						state = stringStates.START_QUOTE_OR_CHAR;
					} else {
						return false;
					}
					break;
			}
		}
	}

	function testNumber() {
		let buffer = '';
		let passedValue;
		let state = numberStates._START_;

		iterator: while (true) {
			let char = source.charAt(index);

			switch (state) {
				case numberStates._START_:
					if (char === '-') {
						state = numberStates.MINUS;
						buffer += char;
						index ++;
					} else if (char === '0') {
						state = numberStates.ZERO;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else if (isDigit1to9(char)) {
						state = numberStates.DIGIT_1TO9;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else {
						break iterator;
					}
					break;

				case numberStates.MINUS:
					if (char === '0') {
						state = numberStates.ZERO;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else if (isDigit1to9(char)) {
						state = numberStates.DIGIT_1TO9;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else {
						break iterator;
					}
					break;

				case numberStates.ZERO:
					if (char === '.') {
						state = numberStates.POINT;
						buffer += char;
						index ++;
					} else if (isExp(char)) {
						state = numberStates.EXP;
						buffer += char;
						index ++;
					} else {
						break iterator;
					}
					break;

				case numberStates.DIGIT_1TO9:
				case numberStates.DIGIT_CEIL:
					if (isDigit(char)) {
						state = numberStates.DIGIT_CEIL;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else if (char === '.') {
						state = numberStates.POINT;
						buffer += char;
						index ++;
					} else if (isExp(char)) {
						state = numberStates.EXP;
						buffer += char;
						index ++;
					} else {
						break iterator;
					}
					break;

				case numberStates.POINT:
					if (isDigit(char)) {
						state = numberStates.DIGIT_FRACTION;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else {
						break iterator;
					}
					break;

				case numberStates.DIGIT_FRACTION:
					if (isDigit(char)) {
						buffer += char;
						index ++;
						passedValue = buffer;
					} else if (isExp(char)) {
						state = numberStates.EXP;
						buffer += char;
						index ++;
					} else {
						break iterator;
					}
					break;

				case numberStates.EXP:
					if (char === '+') {
						state = numberStates.EXP_PLUS;
						buffer += char;
						index ++;
					} else if (char === '-') {
						state = numberStates.EXP_MINUS;
						buffer += char;
						index ++;
					} else if (isDigit(char)) {
						state = numberStates.EXP_DIGIT;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else {
						break iterator;
					}
					break;

				case numberStates.EXP_PLUS:
				case numberStates.EXP_MINUS:
				case numberStates.EXP_DIGIT:
					if (isDigit(char)) {
						state = numberStates.EXP_DIGIT;
						buffer += char;
						index ++;
						passedValue = buffer;
					} else {
						break iterator;
					}
					break;
			}

		}

		if (passedValue) {
			index += passedValue.length;
			column += passedValue.length;
			currentToken = tokenTypes.NUMBER;
			currentValue = passedValue;
			return true;
		} else {
			return false;
		}

	}

	return tokens;
}
