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

function getFixtures(dirname, callback) {
	var folderPath = path.join(__dirname, dirname);
	var folder = fs.readdirSync(folderPath);
	var fixtures = folder
		.filter(function(fixture) {
			return path.extname(fixture) === '.json' && fixture.charAt(0) !== '_';
		})
		.map(function(fileName) {
			return path.basename(fileName, '.json');
		});

	fixtures.forEach(function(fixture) {
		var inputFile = readFile(path.join(folderPath, fixture + '.json'));
		var expectedFile;
		try {
			expectedFile = require(path.join(folderPath, fixture + '.js'));
		} catch (e) {
			expectedFile = null;
		}

		if (callback) {
			callback(fixture, inputFile, expectedFile);
		}
	});
}

describe('Right test fixtures', function() {
	getFixtures('fixtures/valid', function(fixtureName, inputFile, expectedFile) {
		it(fixtureName, function() {
			if (expectedFile) {
				var parsedFile = parse(inputFile, expectedFile.options);
				assert.deepEqual(parsedFile, expectedFile.ast, 'asts are not equal');
			} else {
				/*try {
					parse(inputFile);
					assert.ok(true);
				} catch (e) {
					assert.ok(false);
				}*/
			}
		});
	});
});

describe('Wrong test fixtures', function() {
	getFixtures('fixtures/invalid', function(fixtureName, inputFile, expectedFile) {
		it(fixtureName, function() {
			if (expectedFile) {
				try {
					parse(inputFile, expectedFile.options);
				} catch (e) {
					assert.deepEqual(expectedFile.error.message, e.rawMessage, 'asts are not equal');
				}
			} else {
				/*try {
					parse(inputFile);
					assert.ok(false);
				} catch (e) {
					assert.ok(true);
				}*/
			}
		});
	});
});
