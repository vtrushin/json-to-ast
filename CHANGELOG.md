## v2.0.0-alpha1.5
- Over-escaped identifiers fixing (https://github.com/vtrushin/json-to-ast/issues/17)
- Changed case for node type names
- Changed option "verbose" parameter to "loc"
- Changed "rawValue" to "raw"
- Added "raw" to "Identifier"
- Added pretty message output

## v2.0.0-alpha1.3
- Fixed issue [Infinite loop in parseObject for empty objects when !verbose](https://github.com/vtrushin/json-to-ast/issues/15)

## v2.0.0-alpha1.1

- Added tests from https://github.com/nst/JSONTestSuite
- Changed "value" node to "literal"
- Added "rawValue" for "literal". "value" is cast to type now
- Changed "key" node to "identifier"
- Renamed "position" to "loc"
- Renamed "char" in "loc" to "offset"
- Added "source" to "loc"

## v1.2.15

- Fixed unicode parser bug
