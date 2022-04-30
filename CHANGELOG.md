# Change Log


## 1.1.0 - Public Release
- Added license

## 1.0.2
- Added automatic argument parentheses for `if` and `for` statements. `if x == 0 {}` => `if (x == 0) {}`
- Added lazy `for`. When indexing from `0`, for loops can be written in a shorthand like this: `for (int i < 10) {...}` gets converted to `for (int i = 0; i < 10; i++) {...}`. If no type is specified, `int` will be used.

## 1.0.1
- Added `atomic_uint`
- Added support for inline-curly brackets. `if() {float whatever}`

## 1.0.0
- Initial release
