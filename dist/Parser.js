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

				if (matchedState) {
					if (this.debug) {
						console.log(this.state, token, '->', matchedState);
					}
					this.state = matchedState;
					return true;
				} else {
					return false;
				}
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
				list.push(new Token(tokenTypes.STRING, buffer, line, column, line, column + buffer.length));
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

	var JsonParser = (function () {
		function JsonParser(source) {
			_classCallCheck(this, JsonParser);

			var tokenList = tokenize(source);

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

			var states = ['OPEN_OBJECT', 'OBJECT_KEY', 'OBJECT_COLON', 'OBJECT_VALUE', 'OBJECT_COMMA', '!CLOSE_OBJECT', 'OPEN_ARRAY', 'ARRAY_VALUE', 'ARRAY_COMMA', '!CLOSE_ARRAY'];

			var isValue = function isValue(token) {
				return token.type === tokenTypes.STRING || token.type === tokenTypes.NUMBER || token.type === tokenTypes.TRUE || token.type === tokenTypes.FALSE || token.type === tokenTypes.NULL;
			};

			var ast = undefined;
			var currentContainer = undefined;

			var transitions = {
				'_START_': {
					'OPEN_OBJECT': function OPEN_OBJECT(token) {
						if (token.type === tokenTypes.OPEN_OBJECT) {
							ast = {
								type: 'object'
							};
							ast.properties = currentContainer = [];
							return true;
						}
						return false;
					},
					'OPEN_ARRAY': function OPEN_ARRAY(token) {
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
					'OBJECT_KEY': function OBJECT_KEY(token) {
						if (token.type === tokenTypes.STRING) {
							var _currentContainer = currentContainer;
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
					'OBJECT_VALUE': function OBJECT_VALUE(token) {
						if (isValue(token)) {
							return true;
						}
						return false;
					},
					'OPEN_OBJECT': function OPEN_OBJECT(token) {
						if (token.type === tokenTypes.OPEN_OBJECT) {
							return true;
						}
						return false;
					},
					'OPEN_ARRAY': function OPEN_ARRAY(token) {
						if (token.type === tokenTypes.OPEN_ARRAY) {
							var _currentContainer = currentContainer;
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
					'ARRAY_VALUE': function ARRAY_VALUE(token) {
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
					'ARRAY_VALUE': function ARRAY_VALUE(token) {
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
			this.stateManager.setEqualFunction(function (token, condition) {
				return token.type === condition;
			});

			console.log(this.stateManager.process(this.tokenList));
			console.log(ast);
		}

		_createClass(JsonParser, [{
			key: 'walk',
			value: function walk() {}
		}]);

		return JsonParser;
	})();

	return JsonParser;
})();