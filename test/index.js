var fs = require('fs');
var path = require('path');
var assert = require('assert');
var parse = require('../build');

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
		var inputFile = fs.readFileSync(path.join(folderPath, fixture + '.json'), 'utf8');
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
				assert.deepEqual(expectedFile.ast, parsedFile, 'asts are not equal');
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
