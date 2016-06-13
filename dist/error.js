(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'assert'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('assert'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.assert);
		global.error = mod.exports;
	}
})(this, function (exports, assert) {
	'use strict';

	function nodejsErrorText(message, char, line, column) {
		// console.log(errorText(message));
	}

	function browserErrorText(message, char, line, column) {}

	function error(message, char, line, column) {
		throw new Error(message.replace('{char}', char).replace('{position}', line + ':' + column));
		/*throw new Error(
  	global
  		? nodejsErrorText(message, char, line, column)
  		: browserErrorText(message, char, line, column)
  );*/
	}

	// var a = '{a: 1, b: 2, c: 3, d: { a: 1, b: [2, "ads"] } }';

	// error('Cannot tokenize at {position}', 10, 1, 11);

	// console.log(mocha);
	/*mocha(
 describe('test', function(){
 	assert.deepEqual({a: 1}, {a: 1}, 'asd');
 }));*/

	// assert.deepEqual(new Error(1), {message: 1});

	exports.nodejsErrorText = nodejsErrorText;
	exports.browserErrorText = browserErrorText;
	exports.error = error;
});