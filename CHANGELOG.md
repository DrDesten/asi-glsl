# Change Log
  

## 1.2.2
- Added support for function calls inside of shorthand ifs with 'Add Argument Parentheses'
  - `if f(x) ...` => `if (f(x)) ...` will work

## 1.2.1
- Added shorthand if support to 'Add Argument Parentheses'
  - `if x ...` => `if (x) ...` will work, even without curly brackets (of course it has to be a one-liner, since it's shorthand if)

## 1.2.0
- Improved Lazy `for`
  - 3 different "laziness levels"
  - *Variable names instead of numbers are also valid, argument parentheses must not be used when 'Add Argument Parentheses' is enabled*
  - `for (5) {...}` => `for (int i = 0; i < 5; i++) {...}`
  - `for (i < 5) {...}` => `for (int i = 0; i < 5; i++) {...}`
  - `for (int i < 5) {...}` => `for (int i = 0; i < 5; i++) {...}`
- Improved Readme
- 'Lazy For' and 'Add Argument Parentheses' options are now on by default, as they don't conflict with any valid syntax

## 1.1.0 - Public Release
- Added license
- Added Icon

## 1.0.2
- Added automatic argument parentheses for `if` and `for` statements. `if x == 0 {}` => `if (x == 0) {}`
- Added lazy `for`. When indexing from `0`, for loops can be written in a shorthand like this: `for (int i < 10) {...}` gets converted to `for (int i = 0; i < 10; i++) {...}`. If no type is specified, `int` will be used.

## 1.0.1
- Added `atomic_uint`
- Added support for inline-curly brackets. `if() {float whatever}`

## 1.0.0
- Initial release
