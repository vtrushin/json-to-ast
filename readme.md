# JSON AST parser

[![NPM version](https://img.shields.io/npm/v/json-to-ast.svg)](https://www.npmjs.com/package/json-to-ast)
[![NPM Downloads](https://img.shields.io/npm/dm/json-to-ast.svg)](https://www.npmjs.com/package/json-to-ast)
[![Build Status](https://travis-ci.org/vtrushin/json-to-ast.svg?branch=master)](https://travis-ci.org/vtrushin/json-to-ast)
[![Coverage Status](https://coveralls.io/repos/github/vtrushin/json-to-ast/badge.svg?branch=master)](https://coveralls.io/github/vtrushin/json-to-ast?branch=master)

## About usage
```js
  var Parser = require('json-to-ast');

  console.log(new Parser('{"a": 1}'))
  /*
  =>
  {
    type: 'object',
    properties: [
      {
        type: 'property',
        key: {
          type: 'key',
          value: 'a',
          position: {
            start: {
              line: 1,
              column: 2,
              char: 1
            },
            end: {
              line: 1,
              column: 9,
              char: 8
            }
          }
        },
        value: {
          type: 'number',
          value: '1',
          position: {
            start: {
              line: 1,
              column: 11,
              char: 10
            },
            end: {
              line: 1,
              column: 12,
              char: 11
            }
          }
        }
      }
    ],
    position: {
      start: {
        line: 1,
        column: 1,
        char: 0,
      },
      end: {
        line: 1,
        column: 13,
        char: 12
      }
    }
  }
  */
```

## Output
AST format for object
```js
{
  type: 'object',
  properties: [
    {
      type: 'property',
      key: {
        type: 'key',
        value: 'keyName',
        position: {
          start: {
            line: ...,
            column: ...,
            char: ...
          },
          end: {
            line: ...,
            column: ...,
            char: ...
          }
        }
      },
      value: ...
    }
  ],
  position: {...}
}
```

for array
```js
{
  type: 'array',
  items: [
    ...
  ],
  position: {...}
}
```

for primitive type
```js
{
  type: 'string|number|true|false|null',
  value: ...,
  position: {...}
}
```

[Try out in online (Look at console)](https://rawgit.com/vtrushin/json-to-ast/master/demo/index.html)


## License
ISC
