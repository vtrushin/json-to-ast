import tokenize from './tokenize';
import tokenTypes from './tokenTypes';
import StateManager from './StateManager.js';

/*class Token {
	constructor(type, value, startLine, startCol, endLine, endCol) {
		this.type = type;
		this.value = value;
		this.pos = `${startLine}:${startCol} - ${endLine}:${endCol}`;
		this.desc = (() => {
			return Object.keys(tokenTypes).find(type => tokenTypes[type] === this.type)
		})();
	}
}*/

export default class JsonParser {
	constructor(source) {
		let tokenList = tokenize(source);

		if (tokenList) {
			this.tokenList = tokenList;
		}

		/*let i = 0;
		let _tokenTypes = {
			OPEN_OBJECT:    i++,
			CLOSE_OBJECT:   i++,
			OPEN_ARRAY:     i++,
			CLOSE_ARRAY:    i++
		};*/

		let states = [
			'OPEN_OBJECT',
			'OBJECT_KEY',
			'OBJECT_COLON',
			'OBJECT_VALUE',
			'OBJECT_COMMA',
			'!CLOSE_OBJECT',

			'OPEN_ARRAY',
			'ARRAY_VALUE',
			'ARRAY_COMMA',
			'!CLOSE_ARRAY'
		];

		let isValue = (token) => (
			token.type === tokenTypes.STRING ||
			token.type === tokenTypes.NUMBER ||
			token.type === tokenTypes.TRUE ||
			token.type === tokenTypes.FALSE ||
			token.type === tokenTypes.NULL
		);

		let ast;
		let currentContainer;

		let transitions = {
			'_START_': {
				'OPEN_OBJECT': token => {
					if (token.type === tokenTypes.OPEN_OBJECT) {
						ast = {
							type: 'object'
						};
						ast.properties = currentContainer = [];
						return true;
					}
					return false;
				},
				'OPEN_ARRAY': token => {
					if (token.type === tokenTypes.OPEN_ARRAY) {
						ast = {
							type: 'array'
						};
						ast.items = currentContainer = [];
						return true;
					}
					return false;
				}
			},

			'OPEN_OBJECT': {
				'OBJECT_KEY': token => {
					if (token.type === tokenTypes.STRING) {
						let _currentContainer = currentContainer;
						currentContainer = [];
						_currentContainer.push({
							key: token,
							value: currentContainer
						});
						return true;
					}
					return false;
				},
				'CLOSE_OBJECT': tokenTypes.CLOSE_OBJECT
			},

			'OBJECT_KEY': {
				'OBJECT_COLON': tokenTypes.COLON
			},

			'OBJECT_COLON': {
				'OBJECT_VALUE': token => {
					if (isValue(token)) {
						return true;
					}
					return false
				},
				'OPEN_OBJECT': token => {
					if (token.type === tokenTypes.OPEN_OBJECT) {
						return true;
					}
					return false;
				},
				'OPEN_ARRAY': token => {
					if (token.type === tokenTypes.OPEN_ARRAY) {
						let _currentContainer = currentContainer;
						currentContainer = [];
						_currentContainer.push({
							type: 'array',
							items: currentContainer
						});
						return true;
					}
					return false;
				}
			},

			'OBJECT_VALUE': {
				'OBJECT_COMMA': tokenTypes.COMMA,
				'CLOSE_OBJECT': tokenTypes.CLOSE_OBJECT
			},

			'OBJECT_COMMA': {
				'OBJECT_KEY': tokenTypes.STRING
			},

			'OPEN_ARRAY': {
				'ARRAY_VALUE': token => {
					if (isValue(token)) {
						currentContainer.push({
							value: token
						});
						return true;
					}
					return false;
				},
				'OPEN_OBJECT': tokenTypes.OPEN_OBJECT,
				'OPEN_ARRAY': tokenTypes.OPEN_ARRAY,
				'CLOSE_ARRAY': tokenTypes.CLOSE_ARRAY
			},

			'ARRAY_VALUE': {
				'ARRAY_COMMA': tokenTypes.COMMA,
				'CLOSE_ARRAY': tokenTypes.CLOSE_ARRAY
			},

			'ARRAY_COMMA': {
				'ARRAY_VALUE': token => {
					if (isValue(token)) {
						currentContainer.push({
							value: token
						});
						return true;
					}
					return false;
				},
				'OPEN_OBJECT': tokenTypes.OPEN_OBJECT,
				'OPEN_ARRAY': tokenTypes.OPEN_ARRAY
			}
		};

		this.stateManager = new StateManager(states, transitions, true);
		this.stateManager.setEqualFunction((token, condition) => token.type === condition);

		console.log(this.stateManager.process(this.tokenList));
		console.log(ast);
	}


	walk() {

	}

}