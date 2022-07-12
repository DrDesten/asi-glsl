# Automatic Semicolon Insertion for GLSL

## Features

**Automatic Semicolon Insertion**    
Automatically adds semicolons to GLSL shader programs   
**Argument Parentheses**   
Automatically adds parentheses around the arguments of `if` and `for` statements.   
**Lazy `for`**   
Shorter `for` syntax for indexes starting at zero.  
**Lazy Constructors**  
Infer constructors for vector and matrix types on initialisation  


## Usage

ASI for GLSL is a **formatter**. It will run when you execute the 'Format Document' command. You can set formatting to occur on save, and all changes will be applied every time you save the file.   
Changes will not happen while you type.


### Syntax
**Lazy `for`:**  
`for (5) {...}` => `for (int i = 0; i < 5; i++) {...}`
`for (o < 5) {...}` => `for (int o = 0; o < 5; o++) {...}`
`for (float o < 5) {...}` => `for (float o = 0; o < 5; o++) {...}`

**Argument Parentheses**  
`if x ...` => `if (x) ...`  *works with shorthand if!*  
`for a;b;c {...}` => `for (a;b;c) {...}`  *works with lazy for!*

**Lazy Constructors**  
`vecn var = 0` => `vecn var = vecn(0)`  
`matn var = 0` => `matn var = matn(0)`  
`matnxm var = 0` => `matnxm var = matnxm(0)`