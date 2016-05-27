# JSON AST parser

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
