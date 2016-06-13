var fs = require('fs');
var path = require('path');
var assert = require('assert');
var parse = require('../dist/parse.js');

function readFile(file) {
	var src = fs.readFileSync(file, 'utf8');
	// normalize line endings
	src = src.replace(/\r\n/, '\n');
	// remove trailing newline
	src = src.replace(/\n$/, '');

	return src;
}

function getCases(dirname, callback) {
	var folderPath = path.join(__dirname, dirname);
	var folder = fs.readdirSync(folderPath);
	var cases = folder
		.filter(function(_case) {
			return path.extname(_case) === '.json' && _case.charAt(0) !== '_';
		})
		.map(function(fileName) {
			return path.basename(fileName, '.json');
		});

	cases.forEach(function(_case) {
		var inputFile = readFile(path.join(folderPath, _case + '.json'));
		var expectedAst = require(path.join(folderPath, _case + '.js'));

		if (callback) {
			callback(_case, inputFile, expectedAst);
		}
	});
}

describe('Test cases', function() {
	getCases('cases', function(caseName, inputFile, expectedAst) {
		it(caseName, function() {
			var parsedAst = parse(inputFile, expectedAst.options);
			assert.deepEqual(parsedAst, expectedAst.ast, 'asts are not equal');
		});
	});


});

describe('Error test cases', function() {
	getCases('error-cases', function(caseName, inputFile, expectedAst) {
		it(caseName, function() {
			var parsedAst = parse(inputFile, expectedAst.options);
			assert.deepEqual(parsedAst, expectedAst.ast, 'asts are not equal');
		});
	});
});
