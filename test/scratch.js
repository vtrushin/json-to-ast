require('source-map-support').install();

var parseToAst = require("../dist/parse.js").default;
var Stringify = require("../dist/stringify.js");
var assert = require('assert');
var fs = require('fs');
var path = require('path');


var ast = parseToAst(
`{
    "a": 100,
    /* Comment */
    "b": {
        "c": { "cc" : 3 },
        "d": 4
    }
}
`, { verbose: true });

var obj = Stringify.astToObject(ast);

console.log(Stringify.reprint({
    "b": {
    	"d": 4
    }
}, ast));
