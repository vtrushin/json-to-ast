require('source-map-support').install();

var parseToAst = require("../dist/parse.js").default;
var Stringify = require("../dist/stringify.js");
var assert = require('assert');
var fs = require('fs');
var path = require('path');


var ast = parseToAst(
`{
	"libraries": [
		".",
		"../../framework"
	]
}`, { verbose: true });

var obj = Stringify.astToObject(ast);
obj.libraries.push("./blah");
console.log(Stringify.reprint(obj, ast));
