var parse = require("../dist/parse.js");
var assert = require('assert');

var TESTS = [
  '/* hello */ {  "a": 1 }',
  '{ /* hello */ "a": 1 }',
  '{  "a": /* hello */   1 }',
  '{  "a":  1 /* hello */ }'
];

describe("Comment parsing", function() {
  TESTS.forEach(function(test, index) {
    describe("Comment #" + (index+1), function() {
      var ast = parse(test);
      var out = parse.rewrite(ast);
      assert.equal(out, test);
    });
  });
});
