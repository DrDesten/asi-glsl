# Change Log

## 2.1.2
- Fixed wrong tokenisation of single-line comments

## 2.1.1
- Added option `Add Inline Semicolons`
  - Allows semicolons to be placed everywhere (previous default behaviour)
  - When disabled, semicolons are only placed where newlines are present (new default behaviour)

## 2.1.0
- Fixed bug where Parser would enter an infinite loop
- Extension can now add missing colons in switch statements
- Parser can perform basic type inference
  - Extension can now add explicit type conversions in variable declarations. Similar to, but more robust than `Lazy Constructors`.

## 2.0.1
- Parser can now parse interface blocks
- Parser can now parse initializer lists
- Fixed bug with empty returns

## 2.0.0
- Switched from RegEx based language parsing to a handwritten tokenizer and recursive descent parser
  - Semicolon insertion now covers most edge cases
  - Parenthesis insertion covers more edge cases (such as with only one parenthesis missing
  - Leaves room for more sophisticated methods of syntax error correction
- For now, the old RegEx based method can be enabled using the `Use Legacy Regex` option
- Currently, `Lazy For` and `Lazy Constructors` are not supported by the new parser and will be disabled when `Use Legacy Regex` is not set

## 1.3.1
- Fixed ASI adding semicolons after multiline macro escapes

## 1.3.0
- Added Lazy Constructors
  - Automatically puts in constructor in initialization statements. Only works for numbers as the extension doesn't know about variable types.
  - `vecn var = 0`: `vecn var = vecn(0)`
  - `matn var = 0`: `matn var = matn(0)`
  - `matnxm var = 0`: `matnxm var = matnxm(0)`

## 1.2.3
- Fixed ASI adding semicolons after ':', breaking `switch` statements

## 1.2.2
- Added support for function calls inside of shorthand ifs with `Add Argument Parentheses` option
  - `if f(x) ...`: `if (f(x)) ...` will work

## 1.2.1
- Added shorthand if support with `Add Argument Parentheses` option
  - `if x ...`: `if (x) ...` will work, even without curly brackets (of course it has to be a one-liner, since it's shorthand if)

## 1.2.0
- Improved `Lazy For`
  - 3 different "laziness levels"
  - *Variable names instead of numbers are also valid, argument parentheses must not be used when 'Add Argument Parentheses' is enabled*
  - `for (5) {...}`: `for (int i = 0; i < 5; i++) {...}`
  - `for (o < 5) {...}`: `for (int o = 0; o < 5; o++) {...}`
  - `for (float o < 5) {...}`: `for (float o = 0; o < 5; o++) {...}`
- Improved Readme
- 'Lazy For' and 'Add Argument Parentheses' options are now on by default, as they don't conflict with any valid syntax

## 1.1.0 - Public Release
- Added license
- Added Icon

## 1.0.2
- Added automatic argument parentheses for `if` and `for` statements. `if x == 0 {}`: `if (x == 0) {}`
- Added lazy `for`. When indexing from `0`, for loops can be written in a shorthand like this: `for (int i < 10) {...}` gets converted to `for (int i = 0; i < 10; i++) {...}`. If no type is specified, `int` will be used.

## 1.0.1
- Added `atomic_uint`
- Added support for inline-curly brackets. `if() {float whatever}`

## 1.0.0
- Initial release
