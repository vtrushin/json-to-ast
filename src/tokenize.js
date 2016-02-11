import tokenTypes from './tokenTypes';
import StateManager from './StateManager.js';

class Token {
	constructor(type, value, startLine, startCol, endLine, endCol) {
		this.type = type;
		this.value = value;
		this.pos = `${startLine}:${startCol} - ${endLine}:${endCol}`;
		this.desc = (() => {
			return Object.keys(tokenTypes).find(type => tokenTypes[type] === this.type)
		})();
	}
}

export default function tokenize(source) {
	let list = [];
	let line = 1;
	let column = 1;
	let i = 0;

	let charTokens = {
		'{': tokenTypes.OPEN_OBJECT,
		'}': tokenTypes.CLOSE_OBJECT,
		'[': tokenTypes.OPEN_ARRAY,
		']': tokenTypes.CLOSE_ARRAY,
		':': tokenTypes.COLON,
		',': tokenTypes.COMMA
	};

	let keywordsTokens = {
		'true': tokenTypes.TRUE,
		'false': tokenTypes.FALSE,
		'null': tokenTypes.NULL
	};

	let stringStateManager;
	let numberStateManager;

	(function(){
		let states = [
			'START_QUOTE',
			'CHAR',
			'!END_QUOTE'
		];

		let isNotQuote = (char) => char !== '"';

		let transitions = {
			'_START_': {
				'START_QUOTE': '"'
			},

			'START_QUOTE': {
				'CHAR': isNotQuote,
				'END_QUOTE': '"'
			},

			'CHAR': {
				'CHAR': isNotQuote,
				'END_QUOTE': '"'
			}
		};

		stringStateManager = new StateManager(states, transitions);
	})();

	(function(){
		let states = [
			'MINUS',
			'!ZERO',
			'!DIGIT_1TO9',
			'!DIGIT_CEIL',
			'POINT',
			'!DIGIT_FRACTION',
			'EXP',
			'EXP_PLUS',
			'EXP_MINUS',
			'!EXP_DIGIT'
		];

		let isDigit1to9 = (char) =>  char >= '1' && char <= '9';
		let isDigit = (char) => char >= '0' && char <= '9';
		let isExp = (char) => char === 'e' || char === 'E';

		let transitions = {
			'_START_': {
				'MINUS': '-',
				'ZERO': '0',
				'DIGIT_1TO9': isDigit1to9
			},

			'MINUS': {
				'ZERO': '0',
				'DIGIT_1TO9': isDigit1to9
			},

			'ZERO': {
				'POINT': '.',
				'EXP': isExp
			},

			'DIGIT_1TO9': {
				'DIGIT_CEIL': isDigit,
				'POINT': '.',
				'EXP': isExp
			},

			'DIGIT_CEIL': {
				'DIGIT_CEIL': isDigit,
				'POINT': '.',
				'EXP': isExp
			},

			'POINT': {
				'DIGIT_FRACTION': isDigit
			},

			'DIGIT_FRACTION': {
				'DIGIT_FRACTION': isDigit,
				'EXP': isExp
			},

			'EXP': {
				'EXP_PLUS': '+',
				'EXP_MINUS': '-',
				'EXP_DIGIT': isDigit
			},

			'EXP_PLUS': {
				'EXP_DIGIT': isDigit
			},

			'EXP_MINUS': {
				'EXP_DIGIT': isDigit
			},

			'EXP_DIGIT': {
				'EXP_DIGIT': isDigit
			}
		};

		numberStateManager = new StateManager(states, transitions);
	})();

	function matchWhitespace() {
		let char = source.charAt(i);
		if (char === '\r' || char === '\n') {
			i ++;
			line ++;
			column = 1;
			return true;
		} else if (char === '\t' || char === '\s' || char === ' ') {
			i ++;
			column ++;
			return true;
		} else {
			return false;
		}
	}

	function matchChar() {
		let char = source.charAt(i);

		/*return (char in charTokens) ? {
			type: charTokens[char],
			offset: 1
		} : null;*/

		if (char in charTokens) {
			list.push(new Token(charTokens[char], null, line, column, line, column + 1));
			i ++;
			column ++;
			return true;
		} else {
			return false;
		}
	}

	function matchKeyword() {
		let names = Object.keys(keywordsTokens);
		let matched = names.find(name => {
			return name === source.substr(i, name.length);
		});

		/*return (matched) ? {
			type: keywordsTokens[matched],
			offset: matched.length
		} : null;*/

		if (matched) {
			list.push(new Token(keywordsTokens[matched], null, line, column, line, column));
			i += matched.length;
			column += matched.length;
			return true;
		} else {
			return false;
		}
	}

	function matchString() {
		let k = 0;
		let buffer = '';

		while (i + k < source.length) {
			let char = source.charAt(i + k);
			if (stringStateManager.input(char)) {
				buffer += char;
				k ++;
			} else {
				break;
			}
		}

		/*let result = stringStateManager.isFiniteState() ? {
			type: tokenTypes.STRING,
			value: buffer
		} : null;

		stringStateManager.reset();

		return result;*/

		if (stringStateManager.isFiniteState()) {
			list.push(new Token(tokenTypes.STRING, buffer.substring(1, buffer.length - 1), line, column, line, column + buffer.length));
			i += buffer.length;
			column += buffer.length;
			stringStateManager.reset();
			return true;
		} else {
			stringStateManager.reset();
			return false;
		}
	}


	function matchNumber() {
		let k = 0;
		let buffer = '';

		while (i + k < source.length) {
			let char = source.charAt(i + k);
			if (numberStateManager.input(char)) {
				buffer += char;
				k ++;
			} else {
				break;
			}
		}

		/*let result = numberStateManager.isFiniteState() ? {
			type: tokenTypes.NUMBER,
			value: buffer
		} : null;

		numberStateManager.reset();

		return result;*/

		if (numberStateManager.isFiniteState()) {
			list.push(new Token(tokenTypes.NUMBER, buffer, line, column, line, column + buffer.length));
			i += buffer.length;
			column += buffer.length;
			numberStateManager.reset();
			return true;
		} else {
			numberStateManager.reset();
			return false;
		}
	}


	while (i < source.length) {
		let char = source.charAt(i);
		let match =
			matchWhitespace() ||
			matchChar() ||
			matchKeyword() ||
			matchString() ||
			matchNumber();

		if (match) {

			/*if (type in match) {
				list.push(new Token(type, match.value, line, column, line, column + buffer.length));
			}*/


		} else {
			throw new SyntaxError(`Tokenize error. Cannot process '${char}'`);
		}
	}

	return list;
}