var types = require('../../types');
var object = types.createObject;
var id = types.createIdentifier;
var prop = types.createProperty;
var literal = types.createLiteral;

var ast = object([
	prop(id('quota\"tion', '"quota\\\"tion"'), literal('reverse\\solidus', '"reverse\\\\solidus"')),
	prop(id('soli\/dus', '"soli\\/dus"'), literal('back\bspace', '"back\\bspace"')),
	prop(id('form\ffeed', '"form\\ffeed"'), literal('new\nline', '"new\\nline"')),
	prop(id('re\rturn', '"re\\rturn"'), literal('tab\tsymbol', '"tab\\tsymbol"')),
	prop(id('hex\u0001digit', '"hex\\u0001digit"'), literal('', '""')),
	prop(id('\"\"\"\"', '"\\\"\\\"\\\"\\\""'), literal('\\\\\\', '"\\\\\\\\\\\\"')),
	prop(id('\/', '"\\/"'), literal('\b', '"\\b"')),
	prop(id('\"\/', '"\\\"\\/"'), literal('\"\\\/\b\f\n\r\t\u0001', '"\\\"\\\\\\/\\b\\f\\n\\r\\t\\u0001"'))
]);

module.exports = {
	ast: ast,
	options: {
		loc: false
	}
};
