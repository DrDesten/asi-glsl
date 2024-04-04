import { Position, Range, Token, TokenMatcher, Lexer } from "../lib/lexer.js"

export const TokenType = Object.freeze( {
    Error: Symbol( "Error" ),
    EOF: Symbol( "EOF" ),

    Preprocessor: Symbol( "Preprocessor" ),
    Comment: Symbol( "Comment" ),
    Whitespace: Symbol( "Whitespace" ),
    Newline: Symbol( "Newline" ),

    VarDeclPrefix: Symbol( "VarDeclPrefix" ),
    If: Symbol( "If" ),
    Else: Symbol( "Else" ),
    For: Symbol( "For" ),
    While: Symbol( "While" ),
    Break: Symbol( "Break" ),
    Continue: Symbol( "Continue" ),
    Switch: Symbol( "Switch" ),
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
    new TokenMatcher( TokenType.Preprocessor, /#.*(\r?\n)?/, t => t.props.ignore = true ),
    new TokenMatcher( TokenType.Comment, /\/\/.*(\r?\n)?|\/\*[^]*?\*\//, t => t.props.ignore = true ),
    new TokenMatcher( TokenType.Whitespace, /[^\S\n]+/, t => t.props.ignore = true ),
    new TokenMatcher( TokenType.Newline, /\r?\n/, t => t.props.merge = true ),

    new TokenMatcher( TokenType.VarDeclPrefix, /const|in|out|attribute|uniform|varying|invariant|precise|buffer|shared|centroid|sample|patch|flat|smooth|noperspective/ ),
    new TokenMatcher( TokenType.If, /if/ ),
    new TokenMatcher( TokenType.Else, /else/ ),
    new TokenMatcher( TokenType.For, /for/ ),
    new TokenMatcher( TokenType.While, /while/ ),
    new TokenMatcher( TokenType.Break, /break/ ),
    new TokenMatcher( TokenType.Continue, /continue/ ),
    new TokenMatcher( TokenType.Switch, /switch/ ),
    new TokenMatcher( TokenType.Return, /return/ ),
    new TokenMatcher( TokenType.Discard, /discard/ ),

    new TokenMatcher( TokenType.Literal, /0b[01]+|0x[0-9a-fA-F]+|\d+/ ),
    new TokenMatcher( TokenType.Literal, /(\d+\.\d*|\d*\.\d+)([eE][+-]?\d+)/ ),
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

    new TokenMatcher( TokenType.Operator, /\+\+|\-\-/, t => t.props.operator = new Set( ["prefix", "postfix"] ) ),
    new TokenMatcher( TokenType.Operator, /~|!/, t => t.props.operator = new Set( ["prefix"] ) ),
    new TokenMatcher( TokenType.Operator, /\+|\-/, t => t.props.operator = new Set( ["prefix", "binary"] ) ),
    new TokenMatcher( TokenType.Operator, /\*|\/|%|<<|>>|<=?|>=?|==|!=|&|\^|\||&&|^^|\|\|/, t => t.props.operator = new Set( ["binary"] ) ),
    new TokenMatcher( TokenType.Operator, /(\+|\-|\*|\/|%|<<|>>|&|\^|\|)=?/, t => t.props.operator = new Set( ["binary"] ) ),
]

export const GLSLLexer = new Lexer( Tokens, TokenType.Error, TokenType.EOF )