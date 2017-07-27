debugger;

var parseToAst = require("./dist/parse").default;
var stringify = require("./dist/stringify");

var defaultFunction = module.exports = function(input, settings) {
  return parseToAst(input, settings);
}

defaultFunction.parseToAst = parseToAst;
defaultFunction.astToObject = stringify.astToObject;
defaultFunction.objectToAst = stringify.objectToAst;
defaultFunction.prettyPrint = stringify.prettyPrint;
defaultFunction.reprint = stringify.reprint;
