var parse = require('./build');
var fs = require('fs');

function readFile(file) {
	var src = fs.readFileSync(file, 'utf8');
	// normalize line endings
	src = src.replace(/\r\n/, '\n');
	// remove trailing newline
	src = src.replace(/\n$/, '');

	return src;
}

var a = parse(readFile('./_index.json'));

console.log(a.children[0].key);
