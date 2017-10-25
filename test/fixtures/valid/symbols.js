var types = require('../../types');
var object = types.createObject;
var id = types.createIdentifier;
var prop = types.createProperty;
var array = types.createArray;
var literal = types.createLiteral;

var ast = object([
	prop(id('a<', '"a<"'), literal(2, '2')),
	prop(id('b)', '"b)"'), object([
		prop(id('c(', '"c("'), array([
			literal('3!', '"3!"'),
			literal('4:', '"4:"'),
			literal('5;', '"5;"'),
			literal('6\'', '"6\'"')
		])),
		prop(id('d&', '"d&"'), object([
			prop(id('e!', '"e!"'), literal('~_~', '"~_~"'))
		])),
		prop(id(':e', '":e"'), literal('𠮷', '"𠮷"')),
		prop(id(' f ', '" f "'), literal('*±*∆', '"*±*∆"'))
	]))
]);

module.exports = {
	ast: ast,
	options: {
		loc: false
	}
};
