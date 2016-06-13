var assert = require('assert');
// var mocha = require('mocha').test;

function errorText(text) {
	return `\u001b[31m${text}\u001b[39m`;
}

export function nodejsErrorText(message, char, line, column) {
	// console.log(errorText(message));
}

export function browserErrorText(message, char, line, column) {

}

export function error(message, char, line, column) {
	throw new Error(
		message
			.replace('{char}', char)
			.replace('{position}', `${line}:${column}`)
	);
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


