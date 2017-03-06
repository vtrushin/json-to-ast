# JSON AST parser

[![NPM version](https://img.shields.io/npm/v/json-to-ast.svg)](https://www.npmjs.com/package/json-to-ast)
[![NPM Downloads](https://img.shields.io/npm/dm/json-to-ast.svg)](https://www.npmjs.com/package/json-to-ast)
[![Build Status](https://travis-ci.org/vtrushin/json-to-ast.svg?branch=master)](https://travis-ci.org/vtrushin/json-to-ast)
<!-- [![Coverage Status](https://coveralls.io/repos/github/vtrushin/json-to-ast/badge.svg?branch=master)](https://coveralls.io/github/vtrushin/json-to-ast?branch=master) -->

> npm install json-to-ast

## API

```js
var parse = require('json-to-ast');

var settings = {
	verbose: true, // Show addition information, like node locations. Default is `true`
	fileName: 'data.json' // Name of file, addes into node's location. Default is `<unknown>`
};

parse('{"a": 1}', settings);
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
        loc: {
          start: {
            line: 1,
            column: 2,
            offset: 1
          },
          end: {
            line: 1,
            column: 9,
            offset: 8
          }
        }
      },
      value: {
        type: 'number',
        value: '1',
        loc: {
          start: {
            line: 1,
            column: 11,
            offset: 10
          },
          end: {
            line: 1,
            column: 12,
            offset: 11
          }
        }
      }
    }
  ],
  loc: {
    start: {
      line: 1,
      column: 1,
      offset: 0,
    },
    end: {
      line: 1,
      column: 13,
      offset: 12
    }
  }
}
*/
```

## AST format

Object:

```js
{
  type: 'object',
  properties: [
    {
      type: 'property',
      key: {
        type: 'key',
        value: 'keyName',
        loc: {
          start: {
            line: ...,
            column: ...,
            offset: ...
          },
          end: {
            line: ...,
            column: ...,
            offset: ...
          }
        }
      },
      value: ...
    }
  ],
  loc: {...}
}
```

Array:

```js
{
  type: 'array',
  items: [
    ...
  ],
  loc: {...}
}
```

Primitive:

```js
{
  type: 'string|number|true|false|null',
  value: ...,
  loc: {...}
}
```

[Try it online](https://rawgit.com/vtrushin/json-to-ast/master/demo/astexplorer/index.html) (Fork of [astexplorer.net](https://astexplorer.net/))

## License
MIT
