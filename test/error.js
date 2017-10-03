var assert = require('assert');
var parse = require('../dist/parse.js');

describe('Error messages', function() {
    it('unexpected symbol', function() {
        assert.throws(function() {
            parse('{\n    "foo": incorrect\n}', {
                source: 'path/to/file.json'
            });
        }, function(e) {
            assert.equal(e.rawMessage, 'Unexpected symbol <i> at path/to/file.json:2:12');
            assert.equal(e.source, 'path/to/file.json');
            assert.equal(e.line, 2);
            assert.equal(e.column, 12);
            assert.equal(e.message, [
                'Unexpected symbol <i> at path/to/file.json:2:12',
                '    1 |{',
                '    2 |    "foo": incorrect',
                '------------------^',
                '    3 |}'
            ].join('\n'));
            assert.equal(String(e), [
                'SyntaxError: Unexpected symbol <i> at path/to/file.json:2:12',
                '    1 |{',
                '    2 |    "foo": incorrect',
                '------------------^',
                '    3 |}'
            ].join('\n'));

            return true;
        });
    });

    it('unexpected eof', function() {
        assert.throws(function() {
            parse('{\n    "foo": 123', {
                source: 'path/to/file.json'
            });
        }, function(e) {
            assert.equal(e.rawMessage, 'Unexpected end of input');
            assert.equal(e.source, 'path/to/file.json');
            assert.equal(e.line, 2);
            assert.equal(e.column, 15);
            assert.equal(e.message, [
                'Unexpected end of input',
                '    1 |{',
                '    2 |    "foo": 123',
                '---------------------^'
            ].join('\n'));
            assert.equal(String(e), [
                'SyntaxError: Unexpected end of input',
                '    1 |{',
                '    2 |    "foo": 123',
                '---------------------^'
            ].join('\n'));

            return true;
        });
    });

    it('unexpected token', function() {
        assert.throws(function() {
            parse('{\n    "foo": 123\n}}', {
                source: 'path/to/file.json'
            });
        }, function(e) {
            assert.equal(e.rawMessage, 'Unexpected token <}> at path/to/file.json:3:2');
            assert.equal(e.source, 'path/to/file.json');
            assert.equal(e.line, 3);
            assert.equal(e.column, 2);
            assert.equal(e.message, [
                'Unexpected token <}> at path/to/file.json:3:2',
                '    1 |{',
                '    2 |    "foo": 123',
                '    3 |}}',
                '--------^'
            ].join('\n'));
            assert.equal(String(e), [
                'SyntaxError: Unexpected token <}> at path/to/file.json:3:2',
                '    1 |{',
                '    2 |    "foo": 123',
                '    3 |}}',
                '--------^'
            ].join('\n'));

            return true;
        });
    });
});
