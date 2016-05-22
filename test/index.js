var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Parser = require('../dist/Parser.js');

var folderPath = path.join(__dirname, 'cases');
var folder = fs.readdirSync(folderPath);
var cases = folder
	.filter(function(_case) {
		return path.extname(_case) === '.json';
	})
	.map(function(fileName) {
		return path.basename(fileName, '.json');
	});

function readFile(file) {
	var src = fs.readFileSync(file, 'utf8');
	// normalize line endings
	src = src.replace(/\r\n/, '\n');
	// remove trailing newline
	src = src.replace(/\n$/, '');

	return src;
}

describe('test cases', function() {
	cases.forEach(function(_case) {
		var inputFile = readFile(path.join(folderPath, _case + '.json'));
		var expectedAst = require(path.join(folderPath, _case + '.js'));

		it(_case, function() {
			var parsedAst = new Parser(inputFile, expectedAst.options);
			assert.deepEqual(parsedAst, expectedAst.ast, 'asts are not equal');
		});
	});
});
