# Automatic Semicolon Insertion for GLSL

## Features

**Automatic Semicolon Insertion** <br> 
Automatically adds semicolons to GLSL shader programs <br>
**Argument Parentheses** <br>
Automatically adds parentheses around the arguments of `if` and `for` statements. Disabled by default. <br>
**Lazy `for`** <br>
Shorter `for` syntax for indexes starting at zero. Type `for (i < 10) {...}` and the extension will format it to `for (int i = 0; i < 10; i++) {...}`. Disabled by default.  <br>


## Usage

ASI for GLSL is a **formatter**. It will run when you execute the 'Format Document' command. You can set formatting to occur on save, and all changes will be applied every time you save the file. <br>
Changes will not happen while you type.