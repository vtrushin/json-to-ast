require('source-map-support').install();

var parseToAst = require("../dist/parse.js").default;
var Stringify = require("../dist/stringify.js");
var assert = require('assert');
var fs = require('fs');
var path = require('path');


var ast = parseToAst(
`{
  "libraries": [ {
    "path": "../qooxdoo"
  }, {
    "path": "."
  } ]
}`, { verbose: true });

var obj = Stringify.astToObject(ast);
obj.libraries[1] = [1,2];
console.log(Stringify.reprint(obj, ast));
