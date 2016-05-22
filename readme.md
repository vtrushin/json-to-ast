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

for simple types
```js
{
	type: 'string|number|true|false|null',
	value: ...
}
```

[Try out in online](https://rawgit.com/vtrushin/json-parser/master/index.html)
