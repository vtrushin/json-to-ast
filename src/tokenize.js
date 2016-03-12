import exceptionsDict from './exceptionsDict';
import position from './position';

let _source;
let line;
let column;
let index;
let currentToken;
let currentValue;
let tokens;

const tokenTypes = {
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
let isExp = (char) => char === 'e' || char === 'E';

export default function(source) {
	_source = source;
	line = 1;
	column = 1;
	index = 0;
	currentToken = null;
	currentValue = null;
	tokens = [];

	while (index < _source.length) {
		let startLine = this.line;
		let startColumn = this.column;
		let startIndex = this.index;

		if (testWhitespace()) {
			continue;
		}

		let matched = (
			testChar() ||
			testKeyword() ||
			testString() ||
			testNumber()
		);

		if (matched) {
			tokens.push({
				type: currentToken,
				value: currentValue,
				position: position(startLine, startColumn, startIndex, line, column, index)
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

	return tokens;
}

function testWhitespace() {
	let char = source.charAt(index);

	if (char === '\r' || char === '\n') {
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
	let matched = Object.keys(keywordsTokens).find(name => (
		name === source.substr(index, name.length)
	));

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
	let startIndex = index;
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
					column += index - startIndex;
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
					if (char === 'u') {
						for (let i = 0; i < 4; i ++) {
							let curChar = source.charAt(index);
							if (curChar && isDigit(curChar)) {
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
	let index = this.index;
	let buffer = '';
	let passedValue;
	let state = numberStates._START_;

	iterator: while (true) {
		let char = this.source.charAt(index);

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
		this.index += passedValue.length;
		this.column += passedValue.length;
		this.currentToken = tokenTypes.NUMBER;
		this.currentValue = passedValue;
		return true;
	} else {
		return false;
	}

}










export default class Tokenizer {
	constructor(source) {
		this.source = source;
		this.line = 1;
		this.column = 1;
		this.index = 0;
		this.currentToken = null;
		this.currentValue = null;
		let tokens = [];

		while (this.index < this.source.length) {
			let line = this.line;
			let column = this.column;
			let index = this.index;

			if (this._testWhitespace()) {
				continue;
			}

			let matched = (
			this._testChar() ||
			this._testKeyword() ||
			this._testString() ||
			this._testNumber()
			);

			if (matched) {
				tokens.push({
					type: this.currentToken,
					value: this.currentValue,
					position: position(line, column, index, this.line, this.column, this.index)
				});

				this.currentValue = null;

			} else {
				throw new SyntaxError(
					exceptionsDict.tokenizeSymbolError
						.replace('{char}', this.source.charAt(this.index))
						.replace('{line}', this.line.toString())
						.replace('{column}', this.column.toString())
				);
			}
		}

		return tokens;
	}








}

Tokenizer.LEFT_BRACE = tokenTypes.LEFT_BRACE;
Tokenizer.RIGHT_BRACE = tokenTypes.RIGHT_BRACE;
Tokenizer.LEFT_BRACKET = tokenTypes.LEFT_BRACKET;
Tokenizer.RIGHT_BRACKET = tokenTypes.RIGHT_BRACKET;
Tokenizer.COLON = tokenTypes.COLON;
Tokenizer.COMMA = tokenTypes.COMMA;
Tokenizer.STRING = tokenTypes.STRING;
Tokenizer.NUMBER = tokenTypes.NUMBER;
Tokenizer.TRUE = tokenTypes.TRUE;
Tokenizer.FALSE = tokenTypes.FALSE;
Tokenizer.NULL = tokenTypes.NULL;
