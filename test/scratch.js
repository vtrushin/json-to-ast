var JsonAST = require("../dist/parse.js");
var assert = require('assert');
var fs = require('fs');
var path = require('path');


var ast = JsonAST.parseToAst(
`{
    "a": 100,
    /* Comment */
    "b": {
        "c": { "cc" : 3 }
    }
}`, { verbose: true });

ast = JsonAST.objectToAst({
    "a": 100,
    "b": {
        "c": { "cc" : 3 },
        d: 4
    }
}, ast);

console.log(JsonAST.rewrite(ast));
