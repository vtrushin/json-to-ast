var types = require('../../src/types');
var key = types.createObjectKey;
var location = types.location;
var object = types.createObject;
var prop = types.createObjectProperty;
var array = types.createArray;
var string = types.createString;

var n = array([string('n')]/*, location()*/);
var m = array([string('m'), n]/*, location()*/);
var l = array([string('l'), m]/*, location()*/);
var k = array([string('k'), l]/*, location()*/);
var j = array([string('j'), k]/*, location()*/);
var i = array([string('i'), j]/*, location()*/);
var h = array([string('h'), i]/*, location()*/);
var g = object([prop(key('g'), h)]/*, location()*/);
var f = object([prop(key('f'), g)]/*, location()*/);
var e = object([prop(key('e'), f)]/*, location()*/);
var d = object([prop(key('d'), e)]/*, location()*/);
var c = object([prop(key('c'), d)]/*, location()*/);
var b = object([prop(key('b'/*, location(3, 5, 15, 3, 8, 18)*/), c)]/*, location()*/);
var a = object([prop(key('a'/*, location(2, 3, 4, 2, 6, 7)*/), b)]/*, location(1, 1, 0, 29, 2, 516)*/);

module.exports = {
	ast: a,
	options: {
		verbose: false
	}
};

