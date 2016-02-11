import tokenize from './tokenize';
import tokenTypes from './tokenTypes';
import StateManager from './StateManager.js';

class ArrayAst {
	constructor() {
		this.type = 'array';
		this.items = [];
	}
	add(value) {
		this.items.push(value);
	}
}

class ObjectAst {
	constructor() {
		this.type = 'object';
		this.properties = [];
	}
	add(key, value) {
		this.properties.push({
			key: key,
			value: value
		})
	}
}

export default class JsonParser {
	constructor(source) {
		let tokenList = tokenize(source);

		if (tokenList) {
			this.tokenList = tokenList;
		}

		this.count = 0;
		this.parseJson();
	}

	parseObject() {
		let key;

		let ast = new ObjectAst();

		// object: OPEN_OBJECT (STRING COLON value (COMMA STRING COLON value)*)? CLOSE_OBJECT
		let objectStateManager = new StateManager([
			'OPEN_OBJECT',
			'KEY',
			'COLON',
			'VALUE',
			'COMMA',
			'!CLOSE_OBJECT'
		], {
			'_START_': {
				'OPEN_OBJECT': token => {
					if (token.type === tokenTypes.OPEN_OBJECT) {
						this.count ++;
						return true;
					}
					return false;
				}
			},
			'OPEN_OBJECT': {
				'KEY': token => {
					if (token.type === tokenTypes.STRING) {
						key = token;
						this.count ++;
						return true;
					}
					return false;
				},
				'CLOSE_OBJECT': token => {
					if (token.type === tokenTypes.CLOSE_OBJECT) {
						this.count ++;
						return true;
					}
					return false;
				}
			},
			'KEY': {
				'COLON': token => {
					if (token.type === tokenTypes.COLON) {
						this.count ++;
						return true;
					}
					return false;
				}
			},
			'COLON': {
				'VALUE': token => {
					let value = this.parseValue();
					if (value !== null) {
						ast.add(key, value);
						return true;
					}
					return false;
				}
			},
			'VALUE': {
				'CLOSE_OBJECT': token => {
					if (token.type === tokenTypes.CLOSE_OBJECT) {
						this.count ++;
						return true;
					}
					return false;
				},
				'COMMA': token => {
					if (token.type === tokenTypes.COMMA) {
						this.count ++;
						return true;
					}
					return false;
				}
			},
			'COMMA': {
				'KEY': token => {
					if (token.type === tokenTypes.STRING) {
						key = token;
						this.count ++;
						return true;
					}
					return false;
				}
			}
		}, true);

		//objectStateManager.setEqualFunction((token, condition) => token.type === condition);

		while (this.tokenList[this.count]) {
			var passed = objectStateManager.input(this.tokenList[this.count]);
			if (!passed) {
				return false;
			}

			if (objectStateManager.isFiniteState()) {
				return ast;
			}
		}
	}

	parseArray() {
		let ast = new ArrayAst();

		// array: OPEN_ARRAY (value (COMMA value)*)? CLOSE_ARRAY
		let arrayStateManager = new StateManager([
			'OPEN_ARRAY',
			'VALUE',
			'COMMA',
			'!CLOSE_ARRAY'
		], {
			'_START_': {
				'OPEN_ARRAY': token => {
					if (token.type === tokenTypes.OPEN_ARRAY) {
						this.count ++;
						return true;
					}
					return false;
				}
			},
			'OPEN_ARRAY': {
				'VALUE': token => {
					let value = this.parseValue();
					if (value !== null) {
						ast.add(value);
						return true;
					}
				},
				'CLOSE_ARRAY': token => {
					if (token.type === tokenTypes.CLOSE_ARRAY) {
						this.count ++;
						return true;
					}
					return false;
				}
			},
			'VALUE': {
				'CLOSE_ARRAY': token => {
					if (token.type === tokenTypes.CLOSE_ARRAY) {
						this.count ++;
						return true;
					}
					return false;
				},
				'COMMA': token => {
					if (token.type === tokenTypes.COMMA) {
						this.count ++;
						return true;
					}
					return false;
				}
			},
			'COMMA': {
				'VALUE': token => {
					let value = this.parseValue();
					if (value !== null) {
						ast.add(value);
						return true;
					}
				}
			}
		});

		while (this.tokenList[this.count]) {
			var passed = arrayStateManager.input(this.tokenList[this.count]);
			if (!passed) {
				return false;
			}

			if (arrayStateManager.isFiniteState()) {
				return ast;
			}
		}
	}

	parseValue() {
		// value: object | array | STRING | NUMBER | TRUE | FALSE | NULL
		switch (this.tokenList[this.count].type) {
			case tokenTypes.OPEN_OBJECT:
				return this.parseObject();
			case tokenTypes.OPEN_ARRAY:
				return this.parseArray();
			case tokenTypes.STRING:
			case tokenTypes.NUMBER:
			case tokenTypes.TRUE:
			case tokenTypes.FALSE:
			case tokenTypes.NULL:
				return this.tokenList[this.count++];
		}

		return null;
	}

	parsePair() {

	}

	parseJson() {
		let json;

		// json: object | array
		switch (this.tokenList[this.count].type) {
			case tokenTypes.OPEN_OBJECT:
				json = this.parseObject();
				break;
			case tokenTypes.OPEN_ARRAY:
				json = this.parseArray();
				break;
		}
		console.log(json);
	}

	walk() {

	}

}