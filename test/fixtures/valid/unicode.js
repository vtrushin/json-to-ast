var types = require('../../types');
var array = types.createArray;
var object = types.createObject;
var id = types.createIdentifier;
var prop = types.createProperty;
var literal = types.createLiteral;

var ast = array([
	literal('♥', '"\\u2665"'),
	object([
		prop(id('©', '"\\u00A9"'), literal('𝌆\b\n\t', '"\\uD834\\uDF06\\b\\n\\t"'))
	]),
	literal('', '"\\u007f"'),
	object([
		prop(id('􏿿', '"\\uDBFF\\uDFFF"'), literal('𝄞', '"\\uD834\\uDD1E"'))
	])
]);

module.exports = {
	ast: ast,
	options: {
		loc: false
	}
};
