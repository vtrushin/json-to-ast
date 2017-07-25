require('source-map-support').install();

var parseToAst = require("../dist/parse.js").default;
var Stringify = require("../dist/stringify.js");

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
		if (!name.endsWith(".json") && !name.endsWith(".js"))
			return;
		var pos = name.lastIndexOf('.');
		var subname = name.substring(0, pos);
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
			if (file[ext].match(/\.js$/)) {
				try {
					data[ext] = new Function("input", data[ext]);
				}catch(ex) {
					throw new Error("Cannot create function from " + file[ext] + ": " + ex);
				}
			}
		}
		cb(basename, data);
	}
}

describe("Editing and Rewriting JSON", function() {
	debugger;
	getTests('edit', function(testName, data) {
		it(testName, function() {

			function getJson(obj) {
				var args = [].slice.call(arguments, 1);
				if (typeof obj == "function")
					return obj.apply(null, args);
				if (typeof obj == "string")
					return JSON.parse(obj);
				return obj;
			}

			var astIn = parseToAst(data["in"]);
			var astPojo = Stringify.astToObject(astIn);

			// A ".parsed-in.json" file is used to check that the AST-parsed file produces the correct JS POJO 
			if (data["parsed-in"]) {
				var json = getJson(data["parsed-in"]);
				var jsonStr = JSON.stringify(json);
				var astPojoStr = JSON.stringify(astPojo);
				assert.equal(jsonStr, astPojoStr);
			}

			var edited = astPojo;
			if (data["edit"]) {
				edited = getJson(data["edit"], astPojo);
				if (edited === undefined)
					edited = astPojo;
			}
			
			var printed = Stringify.reprint(edited, astIn);
			var expected = data["out"];
			assert.equal(expected, printed);
		});
	});
});
