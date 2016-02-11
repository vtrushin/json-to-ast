'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var JsonParser = (function () {
	'use strict';

	var i = 0;

	var tokenTypes = {
		OPEN_OBJECT: i++, // {
		CLOSE_OBJECT: i++, // }
		OPEN_ARRAY: i++, // [
		CLOSE_ARRAY: i++, // ]
		COLON: i++, // :
		COMMA: i++, // ,
		STRING: i++, //
		NUMBER: i++, //
		TRUE: i++, // true
		FALSE: i++, // false
		NULL: i++ // null
	};

	var StateManager = (function () {
		function StateManager(states, transitions, debug) {
			var _this = this;

			_classCallCheck(this, StateManager);

			this.states = {
				'_START_': '_START_'
			};

			this.events = {};

			this.debug = debug;

			this.finiteStates = {};
			this.state = this.states['_START_'];

			states.forEach(function (state) {
				if (state.charAt(0) === '!') {
					state = state.substring(1);
					_this.finiteStates[state] = state;
				}
				_this.states[state] = state;
			});

			this.transitions = transitions;
		}

		_createClass(StateManager, [{
			key: 'setEqualFunction',
			value: function setEqualFunction(fn) {
				this.customEqualFn = fn;
			}
		}, {
			key: 'input',
			value: function input(token) {
				var _this2 = this;

				var transition = this.transitions[this.state];

				if (!transition) return false;

				var nextStates = Object.keys(transition);

				var matchedState = nextStates.find(function (nextState) {
					var condition = transition[nextState];
					return typeof condition === 'function' ? condition(token) : _this2.customEqualFn || StateManager.equalFunction(token, condition);
				});

				/*if (this.debug) {
    	debugger;
    }*/

				if (matchedState) {
					if (this.debug) {
						console.log(this.state, token, '->', matchedState);
					}
					this.state = matchedState;
					if (this.events[this.state]) {
						this.events[this.state]();
					}
					return true;
				} else {
					return false;
				}
			}
		}, {
			key: 'on',
			value: function on(transition, callback) {
				this.events[transition] = callback;
			}
		}, {
			key: 'isFiniteState',
			value: function isFiniteState() {
				return this.state in this.finiteStates;
			}
		}, {
			key: 'reset',
			value: function reset() {
				this.state = '_START_';
			}
		}, {
			key: 'process',
			value: function process(source) {
				var _this3 = this;

				if (typeof source === 'string') {
					source = source.split('');
				}

				return source.every(function (token, i) {
					return _this3.input(token);
				});
			}
		}], [{
			key: 'equalFunction',
			value: function equalFunction(token, condition) {
				return token === condition;
			}
		}]);

		return StateManager;
	})();

	var Token = function Token(type, value, startLine, startCol, endLine, endCol) {
		var _this4 = this;

		_classCallCheck(this, Token);

		this.type = type;
		this.value = value;
		this.pos = startLine + ':' + startCol + ' - ' + endLine + ':' + endCol;
		this.desc = (function () {
			return Object.keys(tokenTypes).find(function (type) {
				return tokenTypes[type] === _this4.type;
			});
		})();
	};

	function tokenize(source) {
		var list = [];
		var line = 1;
		var column = 1;
		var i = 0;

		var charTokens = {
			'{': tokenTypes.OPEN_OBJECT,
			'}': tokenTypes.CLOSE_OBJECT,
			'[': tokenTypes.OPEN_ARRAY,
			']': tokenTypes.CLOSE_ARRAY,
			':': tokenTypes.COLON,
			',': tokenTypes.COMMA
		};

		var keywordsTokens = {
			'true': tokenTypes.TRUE,
			'false': tokenTypes.FALSE,
			'null': tokenTypes.NULL
		};

		var stringStateManager = undefined;
		var numberStateManager = undefined;

		(function () {
			var states = ['START_QUOTE', 'CHAR', '!END_QUOTE'];

			var isNotQuote = function isNotQuote(char) {
				return char !== '"';
			};

			var transitions = {
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

		(function () {
			var states = ['MINUS', '!ZERO', '!DIGIT_1TO9', '!DIGIT_CEIL', 'POINT', '!DIGIT_FRACTION', 'EXP', 'EXP_PLUS', 'EXP_MINUS', '!EXP_DIGIT'];

			var isDigit1to9 = function isDigit1to9(char) {
				return char >= '1' && char <= '9';
			};
			var isDigit = function isDigit(char) {
				return char >= '0' && char <= '9';
			};
			var isExp = function isExp(char) {
				return char === 'e' || char === 'E';
			};

			var transitions = {
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
			var char = source.charAt(i);
			if (char === '\r' || char === '\n') {
				i++;
				line++;
				column = 1;
				return true;
			} else if (char === '\t' || char === '\s' || char === ' ') {
				i++;
				column++;
				return true;
			} else {
				return false;
			}
		}

		function matchChar() {
			var char = source.charAt(i);

			/*return (char in charTokens) ? {
   	type: charTokens[char],
   	offset: 1
   } : null;*/

			if (char in charTokens) {
				list.push(new Token(charTokens[char], null, line, column, line, column + 1));
				i++;
				column++;
				return true;
			} else {
				return false;
			}
		}

		function matchKeyword() {
			var names = Object.keys(keywordsTokens);
			var matched = names.find(function (name) {
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
			var k = 0;
			var buffer = '';

			while (i + k < source.length) {
				var char = source.charAt(i + k);
				if (stringStateManager.input(char)) {
					buffer += char;
					k++;
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
			var k = 0;
			var buffer = '';

			while (i + k < source.length) {
				var char = source.charAt(i + k);
				if (numberStateManager.input(char)) {
					buffer += char;
					k++;
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
			var char = source.charAt(i);
			var match = matchWhitespace() || matchChar() || matchKeyword() || matchString() || matchNumber();

			if (match) {

				/*if (type in match) {
    	list.push(new Token(type, match.value, line, column, line, column + buffer.length));
    }*/

			} else {
					throw new SyntaxError('Tokenize error. Cannot process \'' + char + '\'');
				}
		}

		return list;
	}

	var ArrayAst = (function () {
		function ArrayAst() {
			_classCallCheck(this, ArrayAst);

			this.type = 'array';
			this.items = [];
		}

		_createClass(ArrayAst, [{
			key: 'add',
			value: function add(value) {
				this.items.push(value);
			}
		}]);

		return ArrayAst;
	})();

	var ObjectAst = (function () {
		function ObjectAst() {
			_classCallCheck(this, ObjectAst);

			this.type = 'object';
			this.properties = [];
		}

		_createClass(ObjectAst, [{
			key: 'add',
			value: function add(key, value) {
				this.properties.push({
					key: key,
					value: value
				});
			}
		}]);

		return ObjectAst;
	})();

	var JsonParser = (function () {
		function JsonParser(source) {
			_classCallCheck(this, JsonParser);

			var tokenList = tokenize(source);

			if (tokenList) {
				this.tokenList = tokenList;
			}

			this.count = 0;
			this.parseJson();
		}

		_createClass(JsonParser, [{
			key: 'parseObject',
			value: function parseObject() {
				var _this5 = this;

				var key = undefined;

				var ast = new ObjectAst();

				// object: OPEN_OBJECT (STRING COLON value (COMMA STRING COLON value)*)? CLOSE_OBJECT
				var objectStateManager = new StateManager(['OPEN_OBJECT', 'KEY', 'COLON', 'VALUE', 'COMMA', '!CLOSE_OBJECT'], {
					'_START_': {
						'OPEN_OBJECT': function OPEN_OBJECT(token) {
							if (token.type === tokenTypes.OPEN_OBJECT) {
								_this5.count++;
								return true;
							}
							return false;
						}
					},
					'OPEN_OBJECT': {
						'KEY': function KEY(token) {
							if (token.type === tokenTypes.STRING) {
								key = token;
								_this5.count++;
								return true;
							}
							return false;
						},
						'CLOSE_OBJECT': function CLOSE_OBJECT(token) {
							if (token.type === tokenTypes.CLOSE_OBJECT) {
								_this5.count++;
								return true;
							}
							return false;
						}
					},
					'KEY': {
						'COLON': function COLON(token) {
							if (token.type === tokenTypes.COLON) {
								_this5.count++;
								return true;
							}
							return false;
						}
					},
					'COLON': {
						'VALUE': function VALUE(token) {
							var value = _this5.parseValue();
							if (value !== null) {
								ast.add(key, value);
								return true;
							}
							return false;
						}
					},
					'VALUE': {
						'CLOSE_OBJECT': function CLOSE_OBJECT(token) {
							if (token.type === tokenTypes.CLOSE_OBJECT) {
								_this5.count++;
								return true;
							}
							return false;
						},
						'COMMA': function COMMA(token) {
							if (token.type === tokenTypes.COMMA) {
								_this5.count++;
								return true;
							}
							return false;
						}
					},
					'COMMA': {
						'KEY': function KEY(token) {
							if (token.type === tokenTypes.STRING) {
								key = token;
								_this5.count++;
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
		}, {
			key: 'parseArray',
			value: function parseArray() {
				var _this6 = this;

				var ast = new ArrayAst();

				// array: OPEN_ARRAY (value (COMMA value)*)? CLOSE_ARRAY
				var arrayStateManager = new StateManager(['OPEN_ARRAY', 'VALUE', 'COMMA', '!CLOSE_ARRAY'], {
					'_START_': {
						'OPEN_ARRAY': function OPEN_ARRAY(token) {
							if (token.type === tokenTypes.OPEN_ARRAY) {
								_this6.count++;
								return true;
							}
							return false;
						}
					},
					'OPEN_ARRAY': {
						'VALUE': function VALUE(token) {
							var value = _this6.parseValue();
							if (value !== null) {
								ast.add(value);
								return true;
							}
						},
						'CLOSE_ARRAY': function CLOSE_ARRAY(token) {
							if (token.type === tokenTypes.CLOSE_ARRAY) {
								_this6.count++;
								return true;
							}
							return false;
						}
					},
					'VALUE': {
						'CLOSE_ARRAY': function CLOSE_ARRAY(token) {
							if (token.type === tokenTypes.CLOSE_ARRAY) {
								_this6.count++;
								return true;
							}
							return false;
						},
						'COMMA': function COMMA(token) {
							if (token.type === tokenTypes.COMMA) {
								_this6.count++;
								return true;
							}
							return false;
						}
					},
					'COMMA': {
						'VALUE': function VALUE(token) {
							var value = _this6.parseValue();
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
		}, {
			key: 'parseValue',
			value: function parseValue() {
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
		}, {
			key: 'parsePair',
			value: function parsePair() {}
		}, {
			key: 'parseJson',
			value: function parseJson() {
				var json = undefined;

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
		}, {
			key: 'walk',
			value: function walk() {}
		}]);

		return JsonParser;
	})();

	return JsonParser;
})();