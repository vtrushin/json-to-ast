(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './types', './tokenize'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./types'), require('./tokenize'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.types, global.tokenize);
		global.stringify = mod.exports;
	}
})(this, function (exports, _types, _tokenize) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.prettyPrint = prettyPrint;
	exports.reprint = reprint;
	exports.astToObject = astToObject;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	var Writer = function () {
		function Writer() {
			_classCallCheck(this, Writer);

			this.buffer = "";
			this.__indent = 0;
			this.__indentStr = "";
			this.__currentLine = 0;
		}

		/**
   * Writes a string/number.  Multiple lines are rewritten with indentation at the
   * start of each line
   */


		_createClass(Writer, [{
			key: 'write',
			value: function write(str) {
				var t = this;

				if (str === null) str = "null";else if (str === undefined) str = "undefined";else if (typeof str == "number") str = str.toString();else if (typeof str !== "string") throw new Error("Can only write strings and numbers");

				var startPos = 0;
				while (true) {
					var pos = str.indexOf('\n', startPos);
					if (pos > -1) {
						this.buffer += str.substring(startPos, pos + 1);
						this.__currentLine = this.buffer.length;
						this.buffer += this.__indentStr;
						startPos = pos + 1;
					} else {
						this.buffer += str.substring(startPos);
						break;
					}
				}

				return this;
			}
		}, {
			key: 'comments',
			value: function comments(_comments) {
				var t = this;
				if (_comments) {
					_comments.forEach(function (comment) {
						t.write(comment.source + "\n");
					});
				}
			}
		}, {
			key: 'indent',
			value: function indent(count) {
				if (this.__indent + count < 0) throw new Error("Unbalanced indent");
				this.__indent += count;

				var indentStr = this.__indentStr;
				if (count > 0) {
					var str = "";
					for (var i = 0; i < count; i++) {
						str += "  ";
					}indentStr += str;
				} else {
					indentStr = indentStr.substring(0, indentStr.length + count * 2);
				}
				var line = this.buffer.substring(this.__currentLine);
				if (!line.match(/[^\s]/)) {
					this.buffer = this.buffer.substring(0, this.__currentLine) + indentStr;
				}
				this.__indentStr = indentStr;

				return this;
			}
		}, {
			key: 'matchIndent',
			value: function matchIndent() {
				var line = this.buffer.substring(this.__currentLine);
				var m = line.match(/^([\s]*)/);
				var indent = m[0];
				var oldIndent = this.__indentStr;
				this.__indentStr = indent;
				return oldIndent;
			}
		}, {
			key: 'resetIndent',
			value: function resetIndent(indent) {
				this.__indentStr = indent;
			}
		}]);

		return Writer;
	}();

	;

	/**
  * Pretty prints an AST tree
  */
	function prettyPrint(ast) {
		var writer = new Writer();

		/**
   * Writes a node, used recursively
   */
		function writeNode(node) {
			switch (node.type) {
				case "object":
					writer.comments(node.leadingComments);
					writer.write("{\n").indent(+1);
					node.children.forEach(function (child, index) {
						if (index > 0) writer.write(",\n");
						writer.write("\"" + child.key.value + "\" : ");
						writeNode(child.value);
					});
					if (node.children.length) writer.write("\n");
					writer.comments(node.trailingComments);
					writer.indent(-1).write("}");
					break;

				case "array":
					writer.comments(node.leadingComments);
					writer.write("[\n").indent(+1);
					node.children.forEach(function (child, index) {
						if (index > 0) writer.write(",\n");
						writeNode(child.value);
					});
					if (node.children.length) writer.write("\n");
					writer.comments(node.trailingComments);
					writer.indent(-1).write("]\n");
					break;

				case "property":
					writeNode(node.key);
					writer.write(" : ");
					writeNode(node.value);
					break;

				case "identifier":
					writer.write("\"" + node.value + "\"");
					break;

				case "literal":
					writer.comments(node.leadingComments);
					writer.write(node.rawValue);
					writer.comments(node.trailingComments);
					break;

				default:
					throw new Error("Unexpected node type '" + node.type + "'");
			}
		}

		writeNode(ast);

		return writer.buffer;
	}

	/**
  * Prints an object out, using the AST to preserve formatting and whitespace 
  * (and include comments) wherever possible.  Any parts of the object which
  * do not have a corresponding AST tree will be pretty printed  
  * 
  * This is only really suitable for amendments to the object graph because
  * preserving formatting & comments relies on a 1:1 comparison between the
  * AST and the object.  This means that if you move a subset of an object to 
  * another part of the object graph, it will be seen as a deletion of one
  * subset and a brand new subset - you will loose all comments as well as 
  * layout. 
  * 
  * @param object {Object}
  * @param ast {Tokenizer}
  * @return {String}
  */
	function reprint(object, ast) {
		var writer = new Writer();

		if (!ast) {
			prettyPojo(object);
			return writer.buffer;
		}
		var tokenizer = ast.tokenizer;

		/*
   * Pretty prints any old POJO or native value
   */
		function prettyPojo(obj) {
			if (typeof obj == "string") writer.write("\"" + obj + "\"");else if (typeof obj == "number") writer.write(obj);else if (isArray(obj)) {
				writer.write("[ ");
				obj.forEach(function (elem, index) {
					if (index != 0) writer.write(", ");
					prettyPojo(elem);
				});
				writer.write(" ]");
			} else {
				var first = true;
				var oldIndent = writer.matchIndent();
				writer.write("{\n").indent(+1);
				for (var name in obj) {
					if (!first) writer.write(",\n");
					writer.write("\"" + name + "\": ");
					prettyPojo(obj[name]);
					first = false;
				}
				writer.write("\n").indent(-1).write("}");
				writer.resetIndent(oldIndent);
			}
		}

		/*
   * Pretty prints a key:value pair
   */
		function prettyPojoProperty(key, value) {
			writer.write("\"" + key + "\": ");
			prettyPojo(value);
		}

		/*
   * Writes tokens which underly the AST, up to a given index
   */
		var startTokenIndex = 0;
		function writeTokensUntil(index) {
			if (startTokenIndex > -1) {
				while (startTokenIndex < index) {
					var token = tokenizer.tokens[startTokenIndex];
					writer.write(token.rawValue || token.value);
					startTokenIndex++;
				}
			}
		}

		/*
   * Writes an object, comparing it with the AST node.  Used recursively 
   */
		function writeNode(object, node) {

			/*
    * Pretty prints a node to the writer
    */
			function pretty(node) {
				var str = prettyPrint(node);
				writer.write(str);
				startTokenIndex = -1;
			}

			/*
    * Calculates the largest endToken
    * 
    * @param endToken {Number} current largest endToken, or -1 for none
    * @param node {AST Node}
    */
			function maxEndToken(endToken, node) {
				var index;
				if (node.endToken !== undefined) index = node.endToken;else if (node.startToken !== undefined) index = node.startToken;else return endToken;
				if (endToken > index) return endToken;
				return index;
			}

			// No startToken?  Then it was not parsed, pretty print it
			if (node.startToken === undefined) return pretty(node);

			switch (node.type) {
				case "object":
					// If it's not the correct type, then pretty print
					if (!isPlainObject(object)) return prettyPojo(object);

					// Create lookups
					var childAstLookup = {};
					node.children.forEach(function (child, index) {
						childAstLookup[child.key.value] = child;
					});
					var childPropertyLookup = {};
					for (var name in object) {
						childPropertyLookup[name] = object[name];
					} // Opening brace
					writeTokensUntil(node.startToken + 1);

					// Output known children first
					var endToken = -1;
					var first = true;
					for (var i = 0; i < node.children.length; i++) {
						var child = node.children[i];
						var key = child.key.value;
						var value = object[key];

						// Deleted a child?
						if (value === undefined) {
							writeTokensUntil(child.key.startToken);
							startTokenIndex = child.value.endToken + 1;
							if (first && i < node.children.length - 1) {
								while (tokenizer.tokens[startTokenIndex].type != _tokenize.tokenTypes.COMMA) {
									startTokenIndex++;
								}startTokenIndex++;
							}
							continue;
						}

						first = false;
						endToken = maxEndToken(endToken, child.value);

						// Write existing property
						writeTokensUntil(child.value.startToken);
						writeNode(value, child.value);
						delete childPropertyLookup[key];
					}

					// Added properties
					var first = node.children.length === 0;
					var oldIndent = writer.matchIndent();
					for (var name in childPropertyLookup) {
						if (!first) {
							writer.write(",\n");
							first = false;
						}
						prettyPojoProperty(name, childPropertyLookup[name]);
					}

					// Unindent and output the closing brace
					writer.resetIndent(oldIndent);
					if (endToken === -1) startTokenIndex = node.endToken;else startTokenIndex = endToken + 1;
					writeTokensUntil(node.endToken + 1);
					break;

				case "array":
					if (!isArray(object)) return prettyPojo(object);

					// Opening brace
					writeTokensUntil(node.startToken + 1);

					for (var i = 0; i < object.length; i++) {
						var child = i < node.children.length ? node.children[i] : null;
						if (child) {
							writeTokensUntil(child.startToken);
							writeNode(object[i], child);
							startTokenIndex = child.endToken + 1;
						} else {
							if (i == 0) writer.write(", ");
							prettyPojo(object[i]);
							startTokenIndex = node.endToken + 1;
						}
					}

					// Closing brace
					writeTokensUntil(node.endToken + 1);
					break;

				case "property":
					break;

				case "literal":
					// Check type
					if (!isLiteral(object)) return prettyPojo(object);

					// If it has not changed, then use the AST
					if (isSameLiteral(node, object)) {
						writeTokensUntil(node.startToken + 1);

						// New value, but try and preserve prefix comment & whitespace
					} else {
						writeTokensUntil(node.startToken);
						if (typeof object === "string") writer.write("\"" + object + "\"");else writer.write(object);
						startTokenIndex = node.startToken + 1;
					}
					break;

				default:
					throw new Error("Unexpected node type '" + node.type + "'");
			}
		}

		// Go
		writeNode(object, ast);

		// Append any whitespace or comments which trail the JSON
		if (startTokenIndex > -1) {
			while (startTokenIndex < tokenizer.tokens.length) {
				var token = tokenizer.tokens[startTokenIndex++];
				if (token.type != _tokenize.tokenTypes.COMMENT && token.type != _tokenize.tokenTypes.WHITESPACE) break;
				writer.write(token.rawValue || token.value);
			}
		}

		return writer.buffer;
	}

	/**
  * Converts an AST into an ordinary POJO 
  */
	function astToObject(ast, settings) {

		function writeNode(node) {
			var result;

			switch (node.type) {
				case "object":
					result = {};
					node.children.forEach(function (child, index) {
						result[child.key.value] = writeNode(child.value);
					});
					break;

				case "array":
					result = [];
					node.children.forEach(function (child, index) {
						result.push(writeNode(child));
					});
					break;

				case "literal":
					result = node.value;
					break;

				default:
					throw new Error("Unexpected node type '" + node.type + "'");
			}
			return result;
		}

		return writeNode(ast);
	}

	/**
  * Detects whether the value is a native array
  * 
  * @param value {Object}
  * @returns boolean
  */
	function isArray(value) {
		return value !== null && (value instanceof Array || Object.prototype.toString.call(value) === "[object Array]");
	}

	/**
  * Detects whether the value is a native object
  * 
  * @param value {Object}
  * @returns boolean
  */
	function isPlainObject(obj) {
		if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null) {
			var proto = Object.getPrototypeOf(obj);
			return proto === Object.prototype || proto === null;
		}

		return false;
	}

	/**
  * Detects whether the value is a literal value
  * 
  * @param value {Object}
  * @returns boolean
  */
	function isLiteral(obj) {
		if (obj === null || typeof obj === "string" || typeof obj === "number") return true;
		return false;
	}

	function isSameLiteral(node, object) {
		if (node.rawValue === null && object === null) return true;
		if (node.rawValue !== null && object === null || node.rawValue === null && object !== null) return false;
		if (_typeof(node.value) !== (typeof object === 'undefined' ? 'undefined' : _typeof(object))) return false;
		if (typeof node.value === "string") {
			return node.value === object;
		}
		return node.rawValue == object;
	}
});
//# sourceMappingURL=stringify.js.map
