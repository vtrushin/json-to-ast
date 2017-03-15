# JSON AST parser

[![NPM version](https://img.shields.io/npm/v/json-to-ast.svg)](https://www.npmjs.com/package/json-to-ast)
[![NPM Downloads](https://img.shields.io/npm/dm/json-to-ast.svg)](https://www.npmjs.com/package/json-to-ast)
[![Build Status](https://travis-ci.org/vtrushin/json-to-ast.svg?branch=master)](https://travis-ci.org/vtrushin/json-to-ast)
<!-- [![Coverage Status](https://coveralls.io/repos/github/vtrushin/json-to-ast/badge.svg?branch=master)](https://coveralls.io/github/vtrushin/json-to-ast?branch=master) -->

## Install
```
> npm install json-to-ast
```

## Usage

```js
var parse = require('json-to-ast');


var settings = {
  verbose: true, // Show additional information, like node’s locations. Default is `true`
  fileName: 'data.json' // Addes file name information into node's location. Default is `null`
};

parse('{"a": 1}', settings);

/*
=>
{
  type: 'object',
  children: [
    {
      type: 'property',
      children: [
        {
      	  type: 'key',
          value: 'a',
          loc: {
            start: { line: 1, column: 2, offset: 1 },
            end: { line: 1, column: 9, offset: 8 }
          }
      	},
      	{
      	  type: 'value',
      	  value: '1',
      	  loc: {
      	    start: { line: 1, column: 11, offset: 10 },
            end: { line: 1, column: 12, offset: 11 }
      	  }
      	}
      ],
      loc: {
        start: { line: 1, column: 2, offset: 1 },
        end: { line: 1, column: 12, offset: 11 }
      }
    }
  ],
  loc: {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 13, offset: 12 }
  }
}
*/
```

## Node types

Object:
```js
{
  type: 'object',
  children: Property[],
  loc: {...}
}
```

Property:
```js
{
  type: 'property',
  children: [ Key, Value ],
  loc: {...}
}
```

Key:
```js
{
  type: 'key',
  value: String,
  loc: {...}
}
```

Array:
```js
{
  type: 'array',
  children: Value[],
  loc: {...}
}
```

Value:
```js
{
  type: 'value',
  value: String,
  rawValue: String | Number | True | False | Null,
  loc: {...}
}
```

<!--
[Try it online](https://rawgit.com/vtrushin/json-to-ast/master/demo/astexplorer/index.html) (Fork of [astexplorer.net](https://astexplorer.net/))
-->

## License
MIT
