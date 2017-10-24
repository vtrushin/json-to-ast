var types = require('../../types');
var id = types.createIdentifier;
var object = types.createObject;
var prop = types.createProperty;
var array = types.createArray;
var literal = types.createLiteral;

var n = array([literal('n', '"n"')]);
var m = array([literal('m', '"m"'), n]);
var l = array([literal('l', '"l"'), m]);
var k = array([literal('k', '"k"'), l]);
var j = array([literal('j', '"j"'), k]);
var i = array([literal('i', '"i"'), j]);
var h = array([literal('h', '"h"'), i]);
var g = object([prop(id('g', '"g"'), h)]);
var f = object([prop(id('f', '"f"'), g)]);
var e = object([prop(id('e', '"e"'), f)]);
var d = object([prop(id('d', '"d"'), e)]);
var c = object([prop(id('c', '"c"'), d)]);
var b = object([prop(id('b', '"b"'), c)]);
var a = object([prop(id('a', '"a"'), b)]);

module.exports = {
	ast: a,
	options: {
		loc: false
	}
};

