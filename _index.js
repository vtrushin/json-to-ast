var parse = require('./build');
var fs = require('fs');

var a = parse(fs.readFileSync('"\/"', 'utf8'));

console.log(a.children[0].key);
