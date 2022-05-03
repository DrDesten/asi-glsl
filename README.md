# Automatic Semicolon Insertion for GLSL

## Features

**Automatic Semicolon Insertion**    
Automatically adds semicolons to GLSL shader programs   
**Argument Parentheses**   
Automatically adds parentheses around the arguments of `if` and `for` statements.   
**Lazy `for`**   
Shorter `for` syntax for indexes starting at zero.


## Usage

ASI for GLSL is a **formatter**. It will run when you execute the 'Format Document' command. You can set formatting to occur on save, and all changes will be applied every time you save the file.   
Changes will not happen while you type.


### Syntax
**Lazy `for`:**  
`for (5) {...}` => `for (int i = 0; i < 5; i++) {...}`  
`for (i < 5) {...}` => `for (int i = 0; i < 5; i++) {...}`  
`for (int i < 5) {...}` => `for (int i = 0; i < 5; i++) {...}`  

**Argument Parentheses**  
`if x {...}` => `if (x) {...}`  
`for a;b;c {...}` => `for (a;b;c) {...}`  *works with lazy for!*