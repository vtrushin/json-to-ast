var parseToAst = require("../dist/parse.js").default;
var stringify = require("../dist/stringify.js");
var assert = require('assert');
var fs = require('fs');
var path = require('path');


var ast = parseToAst(
`{
    "a": 100
}`, { verbose: true });

ast = stringify.objectToAst({
    "a": 100,
    "b": 200
}, ast);

console.log(stringify.prettyPrint(ast));
console.log("============");
console.log(stringify.rewrite(ast));
