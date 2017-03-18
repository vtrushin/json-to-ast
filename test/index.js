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
		var expectedFile;
		try {
			expectedFile = require(path.join(folderPath, _case + '.js'));
		} catch (e) {
			expectedFile = null;
		}

		if (callback) {
			callback(_case, inputFile, expectedFile);
		}
	});
}

describe('Right test cases', function() {
	getCases('cases/right', function(caseName, inputFile, expectedFile) {
		it(caseName, function() {
			if (expectedFile) {
				var parsedFile = parse(inputFile, expectedFile.options);
				assert.deepEqual(parsedFile, expectedFile.ast, 'asts are not equal');
			} else {
				try {
					parse(inputFile);
					assert.ok(true);
				} catch (e) {
					assert.ok(false);
				}
			}
		});
	});
});

describe('Wrong test cases', function() {
	getCases('cases/wrong', function(caseName, inputFile, expectedFile) {
		it(caseName, function() {
			if (expectedFile) {
				try {
					parse(inputFile, expectedFile.options);
				} catch (e) {
					assert.deepEqual(expectedFile.error.message, e.rawMessage, 'asts are not equal');
				}
			} else {
				try {
					parse(inputFile);
					assert.ok(false);
				} catch (e) {
					/*console.log(e);*/
					assert.ok(true);
				}
			}
		});
	});
});
