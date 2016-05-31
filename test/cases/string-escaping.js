var types = require('../types');
var object = types.createObject;
var prop = types.createObjectProperty;
var string = types.createString;

var ast = object([
	prop('quota\\\"tion', string('reverse\\\\solidus')),
	prop('soli\\/dus', string('back\\bspace')),
	prop('form\\ffeed', string('new\\nline')),
	prop('re\\rturn', string('tab\\tsymbol')),
	prop('hex\\u0001digit', string('')),
	prop('\\\"\\\"\\\"\\\"', string('\\\\\\\\\\\\')),
	prop('\\/', string('\\b')),
	prop('\\\"\\/', string('\\\"\\\\\\/\\b\\f\\n\\r\\t\\u0001'))
]);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};
