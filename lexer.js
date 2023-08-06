class TokenMatcher {
    constructor(name, regex) {
        this.name = name 
        this.regex = regex
    }
}
const Tokens = [
    new TokenMatcher("preprocessor", /#([^\n]|\\\n)*/g),
    new TokenMatcher("comment", /\/\/.*|\/\*.*?\*\//g),

    new TokenMatcher("identifier", /[a-zA-Z_$][a-zA-Z_$0-9]*/g),
    new TokenMatcher("number", /(\d+|\.\d+|\d+\.|\d+\.\d+)([eE][+-]?\d+)?/g),

    new TokenMatcher("lparen", /\(/g),
    new TokenMatcher("rparen", /\)/g),
    new TokenMatcher("lbrace", /\{/g),
    new TokenMatcher("rbrace", /\}/g),
    new TokenMatcher("lbrack", /\[/g),
    new TokenMatcher("rbrack", /\]/g),

    new TokenMatcher("operator", /\.|\+\+|\-\-|\+|\-|\*|\/|\%|\||\^|&|<<|>>/g)
]

class Lexer {
    constructor(string = "") {
        this.source = string
        this.tokens = []
    }

    lex() {

    }
}


module.exports = {
    Lexer
}