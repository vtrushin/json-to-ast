var fs = require('fs');
var path = require('path');
var assert = require('assert');
var JsonParser = require('../dist/Parser.js');

console.log(JsonParser);

var cases = fs.readdirSync(path.join(__dirname, 'cases'));

function readFile(file) {
	var src = fs.readFileSync(file, 'utf8');
	// normalize line endings
	src = src.replace(/\r\n/, '\n');
	// remove trailing newline
	src = src.replace(/\n$/, '');

	return src;
}

cases.forEach(function(caseName) {
	describe('cases "' + caseName + '"', function() {
		var dir = path.join(__dirname, 'cases', caseName);
		var inputFile = path.join(dir, 'input.json');
		// var astFile = path.join(dir, 'ast.json');
		console.log(33, path.join(dir, 'index.js'));
		var expectedAst = require('./cases/' + caseName + '/index.js');

		it('should match ast.json', function() {
			var parsedAst = new JsonParser(readFile(inputFile), {
				verbose: false
			});

			/*console.log(1, ast.properties[0]);
			console.log(2, JSON.parse(readFile(astFile)).properties[0]);*/

			assert.deepEqual(parsedAst, expectedAst, 'asts are not equal');
		});
	});
});

/*describe('smthng', function() {

	it('Test', function() {
		assert.equal(1, 1);
	});

});*/
