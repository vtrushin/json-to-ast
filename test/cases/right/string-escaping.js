var types = require('../../src/types');
var object = types.createObject;
var key = types.createObjectKey;
var prop = types.createObjectProperty;
var string = types.createString;

var ast = object([
	prop(key('quota\\\"tion'), string('reverse\\\\solidus')),
	prop(key('soli\\/dus'), string('back\\bspace')),
	prop(key('form\\ffeed'), string('new\\nline')),
	prop(key('re\\rturn'), string('tab\\tsymbol')),
	prop(key('hex\\u0001digit'), string('')),
	prop(key('\\\"\\\"\\\"\\\"'), string('\\\\\\\\\\\\')),
	prop(key('\\/'), string('\\b')),
	prop(key('\\\"\\/'), string('\\\"\\\\\\/\\b\\f\\n\\r\\t\\u0001'))
]);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
