var parseToAst = require("dist/parse.js").default;
var stringify = require("dist/stringify.js");

module.exports = function defaultFunction(input, settings) {
  return parseToAst(input, settings);
}

defaultFunction.parseToAst = parseToAst;
defaultFunction.astToObject = stringify.astToObject;
defaultFunction.objectToAst = stringify.objectToAst;
defaultFunction.prettyPrint = stringify.prettyPrint;
defaultFunction.rewrite = stringify.rewrite;
