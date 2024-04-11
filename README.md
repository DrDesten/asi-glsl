# Automatic Semicolon Insertion for GLSL

ASI for GLSL is an extension that aims to catch and fix syntax errors automatically.


## Feature: Automatic Semicolon Insertion
Automatically adds semicolons to GLSL shader programs.  
The AST Parser generally performs better than the RegEx based approach.


## Extra Features: AST Parser

### Automatic Parentheses
Automatically adds missing parentheses to `if`, `switch`, `for`, `while` and `do-while` statements.  

### Automatic Colons
Automatically adds missing colons in `switch` statements. 

### Automatic Explicit Type Conversions
Automatically adds explicit type conversions in variable declarations when the initializer is not implicitly convertible to the declared type.


## Extra Features: Legacy RegEx

### Automatic Argument Parentheses
Automatically adds parentheses around the arguments of `if` and `for` statements.  
|Shorthand|Expanded|
|-|-|
|`if x ...`|`if (x) ...`|
|`for a;b;c { ... }`|`for (a;b;c) { ... }`|

### Lazy for
Shorter `for` syntax for indexes starting at zero.  
|Shorthand|Expanded|
|-|-|
|`for (5) { ... }`|`for (int i = 0; i < 5; i++) { ... }`|
|`for (o < 5) { ... }`|`for (int o = 0; o < 5; o++) { ... }`|
|`for (float o < 5) { ... }`|`for (float o = 0; o < 5; o++) { ... }`|

### Lazy Constructors
Infer constructors for vector and matrix types on initialization  
|Shorthand|Expanded|
|-|-|
|`vecn var = 0`|`vecn var = vecn(0)`|
|`matn var = 0`|`matn var = matn(0)`|
|`matnxm var = 0`|`matnxm var = matnxm(0)`|


## Usage

ASI for GLSL is a **formatter**. It will run when you execute the 'Format Document' command. You can set formatting to occur on save, and all changes will be applied every time you save the file.   
Changes will **not** happen while you type.