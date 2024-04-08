# Automatic Semicolon Insertion for GLSL

ASI for GLSL is an extension that aims to catch and fix syntax errors automatically.

## Features

### Automatic Semicolon Insertion
Automatically adds semicolons to GLSL shader programs

### Automatic Argument Parentheses
Automatically adds parentheses around the arguments of `if`, `switch`, `for` and `while` statements.  
This feature will behave differently depending on whether `Use Legacy Regex` is enabled or not. With `Use Legacy Regex` only `if` and `for` statements are supported.

### Lazy for 
Shorter `for` syntax for indexes starting at zero.  
*Only available with `Use Legacy Regex`*

### Lazy Constructors
Infer constructors for vector and matrix types on initialisation  
*Only available with `Use Legacy Regex`*


## Usage

ASI for GLSL is a **formatter**. It will run when you execute the 'Format Document' command. You can set formatting to occur on save, and all changes will be applied every time you save the file.   
Changes will **not** happen while you type.


## Extra Syntax

#### **Automatic Argument Parentheses**  
|Shorthand|Expanded|
|-|-|
|`if x ...`|`if (x) ...`|
|`switch x ...`|`switch (x) ...`|
|`for a;b;c { ... }`|`for (a;b;c) { ... }`|
|`while x ... `|`while (x) ... `|

#### **Lazy for**
|Shorthand|Expanded|
|-|-|
|`for (5) { ... }`|`for (int i = 0; i < 5; i++) { ... }`|
|`for (o < 5) { ... }`|`for (int o = 0; o < 5; o++) { ... }`|
|`for (float o < 5) { ... }`|`for (float o = 0; o < 5; o++) { ... }`|

#### **Lazy Constructors**  
|Shorthand|Expanded|
|-|-|
|`vecn var = 0`|`vecn var = vecn(0)`|
|`matn var = 0`|`matn var = matn(0)`|
|`matnxm var = 0`|`matnxm var = matnxm(0)`|