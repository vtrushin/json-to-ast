var types = require('../types');
var key = types.createObjectKey;
var position = types.position;
var object = types.createObject;
var prop = types.createObjectProperty;
var array = types.createArray;
var string = types.createString;

var n = array([string('n')]/*, position()*/);
var m = array([string('m'), n]/*, position()*/);
var l = array([string('l'), m]/*, position()*/);
var k = array([string('k'), l]/*, position()*/);
var j = array([string('j'), k]/*, position()*/);
var i = array([string('i'), j]/*, position()*/);
var h = array([string('h'), i]/*, position()*/);
var g = object([prop(key('g'), h)]/*, position()*/);
var f = object([prop(key('f'), g)]/*, position()*/);
var e = object([prop(key('e'), f)]/*, position()*/);
var d = object([prop(key('d'), e)]/*, position()*/);
var c = object([prop(key('c'), d)]/*, position()*/);
var b = object([prop(key('b'/*, position(3, 5, 15, 3, 8, 18)*/), c)]/*, position()*/);
var a = object([prop(key('a'/*, position(2, 3, 4, 2, 6, 7)*/), b)]/*, position(1, 1, 0, 29, 2, 516)*/);

module.exports = {
	ast: a,
	options: {
		verbose: false
	}
};

