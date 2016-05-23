JSON AST parser
======

AST format for object
```js
{
  type: 'object',
  properties: [
    {
      key: {
        text: 'keyName',
        position: Position
      },
      value: ...
    }
  ],
  position: Position
}
```

for array
```js
{
  type: 'array',
  items: [
    ...
  ],
  position: Position
}
```

for primitive type
```js
{
  type: 'string|number|true|false|null',
  value: ...
}
```

[Try out in online (Look at console)](https://rawgit.com/vtrushin/json-to-ast/master/demo/index.html)
