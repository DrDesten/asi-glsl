const { Position, Range, Token, TokenMatcher, Lexer } = require( "../lib/lexer.js" )

const TokenType = Object.freeze( {
    Error: Symbol( "Error" ),
    EOF: Symbol( "EOF" ),

    Preprocessor: Symbol( "Preprocessor" ),
    Comment: Symbol( "Comment" ),
    Whitespace: Symbol( "Whitespace" ),
    Newline: Symbol( "Newline" ),

    Precision: Symbol( "Precision" ),
    Struct: Symbol( "Struct" ),
    Layout: Symbol( "Layout" ),
    Qualifier: Symbol( "Qualifier" ),

    If: Symbol( "If" ),
    Else: Symbol( "Else" ),
    For: Symbol( "For" ),
    While: Symbol( "While" ),
    Do: Symbol( "Do" ),
    Break: Symbol( "Break" ),
    Continue: Symbol( "Continue" ),
    Switch: Symbol( "Switch" ),
    Case: Symbol( "Case" ),
    Default: Symbol( "Default" ),
    Return: Symbol( "Return" ),
    Discard: Symbol( "Discard" ),

    Literal: Symbol( "Literal" ),
    Identifier: Symbol( "Identifier" ),

    Colon: Symbol( "Colon" ),
    Semicolon: Symbol( "Semicolon" ),
    Comma: Symbol( "Comma" ),
    Dot: Symbol( "Dot" ),

    LParen: Symbol( "LParen" ),
    RParen: Symbol( "RParen" ),
    LBrace: Symbol( "LBrace" ),
    RBrace: Symbol( "RBrace" ),
    LBrack: Symbol( "LBrack" ),
    RBrack: Symbol( "RBrack" ),

    Operator: Symbol( "Operator" ),
} )

const Tokens = [
    new TokenMatcher( TokenType.Preprocessor, /#(\\\r?\n|.)*(\r?\n)?/, { ignore: true } ),
    new TokenMatcher( TokenType.Comment, /\/\/.*(\r?\n)?|\/\*[^]*?\*\//, { ignore: true } ),
    new TokenMatcher( TokenType.Whitespace, /[^\S\n]+/, { ignore: true } ),
    new TokenMatcher( TokenType.Newline, /\r?\n/, { merge: true } ),

    new TokenMatcher( TokenType.Precision, /precision/ ),
    new TokenMatcher( TokenType.Struct, /struct/ ),
    new TokenMatcher( TokenType.Layout, /layout/ ),
    new TokenMatcher( TokenType.Qualifier, /const|in|out|varying|attribute|uniform|buffer|shared/, { qualifier: "storage" } ),
    new TokenMatcher( TokenType.Qualifier, /centroid|sample|patch/, { qualifier: "aux storage" } ),
    new TokenMatcher( TokenType.Qualifier, /smooth|flat|noperspective/, { qualifier: "interpolation" } ),
    new TokenMatcher( TokenType.Qualifier, /highp|mediump|lowp/, { qualifier: "precision" } ),
    new TokenMatcher( TokenType.Qualifier, /invariant/, { qualifier: "variance" } ),
    new TokenMatcher( TokenType.Qualifier, /precise/, { qualifier: "precise" } ),
    new TokenMatcher( TokenType.Qualifier, /coherent|volatile|restrict|readonly|writeonly/, { qualifier: "memory" } ),

    new TokenMatcher( TokenType.If, /if/ ),
    new TokenMatcher( TokenType.Else, /else/ ),
    new TokenMatcher( TokenType.For, /for/ ),
    new TokenMatcher( TokenType.While, /while/ ),
    new TokenMatcher( TokenType.Do, /do/ ),
    new TokenMatcher( TokenType.Break, /break/ ),
    new TokenMatcher( TokenType.Continue, /continue/ ),
    new TokenMatcher( TokenType.Switch, /switch/ ),
    new TokenMatcher( TokenType.Case, /case/ ),
    new TokenMatcher( TokenType.Default, /default/ ),
    new TokenMatcher( TokenType.Return, /return/ ),
    new TokenMatcher( TokenType.Discard, /discard/ ),

    new TokenMatcher( TokenType.Literal, /true|false/, { type: "bool" } ),
    new TokenMatcher( TokenType.Literal, /0[0-7]+|\d+|0[xX][0-9a-fA-F]+/, { type: "int" } ),
    new TokenMatcher( TokenType.Literal, /(0[0-7]+|\d+|0[xX][0-9a-fA-F]+)[uU]/, { type: "uint" } ),
    new TokenMatcher( TokenType.Literal, /(\d+\.\d+|\d+\.|\.\d+)([eE][+-]?\d+)?[fF]?|\d+[eE][+-]?\d+[fF]?/, { type: "float" } ),
    new TokenMatcher( TokenType.Literal, /(\d+\.\d+|\d+\.|\.\d+)([eE][+-]?\d+)?[fF]?|\d+[eE][+-]?\d+(lf|LF)?/, { type: "double" } ),
    new TokenMatcher( TokenType.Identifier, /[a-zA-Z_][a-zA-Z0-9_]*/ ),

    new TokenMatcher( TokenType.Colon, /:/ ),
    new TokenMatcher( TokenType.Semicolon, /;/ ),
    new TokenMatcher( TokenType.Comma, /,/ ),
    new TokenMatcher( TokenType.Dot, /\./ ),

    new TokenMatcher( TokenType.LParen, /\(/ ),
    new TokenMatcher( TokenType.RParen, /\)/ ),
    new TokenMatcher( TokenType.LBrace, /\{/ ),
    new TokenMatcher( TokenType.RBrace, /\}/ ),
    new TokenMatcher( TokenType.LBrack, /\[/ ),
    new TokenMatcher( TokenType.RBrack, /\]/ ),

    new TokenMatcher( TokenType.Operator, /\+\+|\-\-/, { operator: new Set( ["prefix", "postfix"] ) } ),
    new TokenMatcher( TokenType.Operator, /~|!/, { operator: new Set( ["prefix"] ) } ),
    new TokenMatcher( TokenType.Operator, /\+|\-/, { operator: new Set( ["prefix", "binary"] ) } ),
    new TokenMatcher( TokenType.Operator, /\*|\/|%|<<|>>|<=?|>=?|==|!=|&&?|\^\^?|\|\|?/, { operator: new Set( ["binary"] ) } ),
    new TokenMatcher( TokenType.Operator, /\?/, { operator: new Set( ["ternary"] ) } ),
    new TokenMatcher( TokenType.Operator, /(\+|\-|\*|\/|%|<<|>>|&|\^|\|)?=/, { operator: new Set( ["assignment"] ) } ),
]

const GLSLLexer = new Lexer( Tokens, TokenType.Error, TokenType.EOF )
const CustomGLSLLexer = props => new Lexer( Tokens, TokenType.Error, TokenType, props )

module.exports = {
    TokenType,
    GLSLLexer,
    CustomGLSLLexer,
}