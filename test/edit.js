var JsonAST = require("../dist/parse.js");
var assert = require('assert');
var fs = require('fs');
var path = require('path');

function readFile(filename, cb) {
  fs.readFile(filename, { encoding: "utf-8" }, function(err, data) {
    if (err && err.code == "ENOENT")
      return cb(null, null);
    return cb(err, data);
  });
}

function getTests(dirname, cb) {
  var folderPath = path.join(__dirname, dirname);
  var folder = fs.readdirSync(folderPath);
  var files = {};
  folder.forEach(function(name) {
    if (!name.endsWith(".json"))
      return;
    var subname = name.substring(0, name.length - 5);
    var pos = subname.lastIndexOf('.');
    var ext = subname.substring(pos + 1);
    var basename = subname.substring(0, pos);
    if (files[basename] === undefined)
      files[basename] = {};
    files[basename][ext] = folderPath + "/" + name;
  });
  for (var basename in files) {
    var file = files[basename];
    if (!file["in"])
      continue;
    var data = {};
    for (var ext in file) {
      data[ext] = fs.readFileSync(file[ext], "utf8");
    }
    cb(basename, data);
  }
}

describe("Editing and Rewriting JSON", function() {
  getTests('edit', function(testName, data) {
    it(testName, function() {
      var astIn = JsonAST.parseToAst(data["in"]);
      
      // A ".parsed-in.json" file is used to check that the AST-parsed file produces the correct JS POJO 
      if (data["parsed-in"]) {
        var json = JSON.parse(data["parsed-in"]);
        var jsonStr = JSON.stringify(json);
        var astPojo = JsonAST.astToObject(ast);
        var astPojoStr = JSON.stringify(astPojo);
        assert.equal(jsonStr, astPojoStr);
      }

      // A ".merge.json" is a JSON POJO to merge into the AST loaded from ".in.json"
      if (data["merge"]) {
        var pojoMerge = JSON.parse(data["merge"]);
        JsonAST.objectToAst(pojoMerge, astIn);
      }
      
      // Check we can write it out again
      var out = JsonAST.rewrite(astIn);
      assert.equal(data["out"], out);
    });
  });
});
