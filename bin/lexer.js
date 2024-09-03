const { Token, TokenMatcher, Lexer } = require( "../lib/lexer.js" )

const TokenType = Object.freeze( {
    Error: "Error",
    EOF: "EOF",

    Preprocessor: "Preprocessor",
    Comment: "Comment",
    Whitespace: "Whitespace",
    Newline: "Newline",

    Precision: "Precision",
    Struct: "Struct",
    Layout: "Layout",
    Qualifier: "Qualifier",

    If: "If",
    Else: "Else",
    For: "For",
    While: "While",
    Do: "Do",
    Break: "Break",
    Continue: "Continue",
    Switch: "Switch",
    Case: "Case",
    Default: "Default",
    Return: "Return",
    Discard: "Discard",

    Literal: "Literal",
    Identifier: "Identifier",

    Colon: "Colon",
    Semicolon: "Semicolon",
    Comma: "Comma",
    Dot: "Dot",

    ParenOpen: "ParenOpen",
    ParenClose: "ParenClose",
    BraceOpen: "BraceOpen",
    BraceClose: "BraceClose",
    BrackOpen: "BrackOpen",
    BrackClose: "BrackClose",

    Operator: "Operator",
} )

function GLSLLexer( version = Infinity, props = {} ) {
    const Matchers = [
        new TokenMatcher( TokenType.Preprocessor, /#(\\\r?\n|.)*(\r?\n)?/, { ignore: true } ),
        new TokenMatcher( TokenType.Comment, /\/\/.*(?=\r?\n|$)|\/\*[^]*?\*\//, { ignore: true } ),
        new TokenMatcher( TokenType.Whitespace, /[^\S\n]+/, { ignore: true } ),
        new TokenMatcher( TokenType.Newline, /(\r?\n)+/, { merge: true } ),

        new TokenMatcher( TokenType.Precision, /\bprecision\b/ ),
        new TokenMatcher( TokenType.Struct, /\bstruct\b/ ),
        new TokenMatcher( TokenType.Layout, /\blayout\b/ ),
        new TokenMatcher( TokenType.Qualifier, /\b(const|inout|in|out|varying|attribute|uniform|buffer|shared)\b/, { qualifier: "storage" } ),
        new TokenMatcher( TokenType.Qualifier, /\b(centroid|sample|patch)\b/, { qualifier: "aux storage" } ),
        new TokenMatcher( TokenType.Qualifier, /\b(smooth|flat|noperspective)\b/, { qualifier: "interpolation" } ),
        new TokenMatcher( TokenType.Qualifier, /\b(highp|mediump|lowp)\b/, { qualifier: "precision" } ),
        new TokenMatcher( TokenType.Qualifier, /\binvariant\b/, { qualifier: "variance" } ),
        new TokenMatcher( TokenType.Qualifier, /\bprecise\b/, { qualifier: "precise" } ),
        new TokenMatcher( TokenType.Qualifier, /\b(coherent|volatile|restrict|readonly|writeonly)\b/, { qualifier: "memory" } ),

        new TokenMatcher( TokenType.If, /\bif\b/ ),
        new TokenMatcher( TokenType.Else, /\belse\b/ ),
        new TokenMatcher( TokenType.For, /\bfor\b/ ),
        new TokenMatcher( TokenType.While, /\bwhile\b/ ),
        new TokenMatcher( TokenType.Do, /\bdo\b/ ),
        new TokenMatcher( TokenType.Break, /\bbreak\b/ ),
        new TokenMatcher( TokenType.Continue, /\bcontinue\b/ ),
        new TokenMatcher( TokenType.Switch, /\bswitch\b/ ),
        new TokenMatcher( TokenType.Case, /\bcase\b/ ),
        new TokenMatcher( TokenType.Default, /\bdefault\b/ ),
        new TokenMatcher( TokenType.Return, /\breturn\b/ ),
        new TokenMatcher( TokenType.Discard, /\bdiscard\b/ ),

        new TokenMatcher( TokenType.Literal, /(\d+\.\d+|\d+\.|\.\d+)([eE][+-]?\d+)?(lf|LF)|\d+[eE][+-]?\d+(lf|LF)/, { type: "double" } ),
        new TokenMatcher( TokenType.Literal, /(\d+\.\d+|\d+\.|\.\d+)([eE][+-]?\d+)?[fF]?|\d+[eE][+-]?\d+[fF]?/, { type: "float" } ),
        new TokenMatcher( TokenType.Literal, /(0[0-7]+|\d+|0[xX][0-9a-fA-F]+)[uU]/, { type: "uint" } ),
        new TokenMatcher( TokenType.Literal, /0[0-7]+|\d+|0[xX][0-9a-fA-F]+/, { type: "int" } ),
        new TokenMatcher( TokenType.Literal, /\b(true|false)\b/, { type: "bool" } ),
        new TokenMatcher( TokenType.Identifier, /[a-zA-Z_][a-zA-Z0-9_]*/ ),

        new TokenMatcher( TokenType.Colon, /:/ ),
        new TokenMatcher( TokenType.Semicolon, /;/ ),
        new TokenMatcher( TokenType.Comma, /,/ ),
        new TokenMatcher( TokenType.Dot, /\./ ),

        new TokenMatcher( TokenType.ParenOpen, /\(/ ),
        new TokenMatcher( TokenType.ParenClose, /\)/ ),
        new TokenMatcher( TokenType.BraceOpen, /\{/ ),
        new TokenMatcher( TokenType.BraceClose, /\}/ ),
        new TokenMatcher( TokenType.BrackOpen, /\[/ ),
        new TokenMatcher( TokenType.BrackClose, /\]/ ),

        new TokenMatcher( TokenType.Operator, /(\+|\-|\*|\/|%|<<|>>|&|\^|\|)?=/, { operator: new Set( ["assignment"] ) } ),
        new TokenMatcher( TokenType.Operator, /\+\+|\-\-/, { operator: new Set( ["unary", "postfix"] ) } ),
        new TokenMatcher( TokenType.Operator, /[!=]=/, { operator: new Set( ["equality"] ) } ),
        new TokenMatcher( TokenType.Operator, /<=?|>=?/, { operator: new Set( ["relational"] ) } ),
        new TokenMatcher( TokenType.Operator, /\+|\-/, { operator: new Set( ["unary", "additive"] ) } ),
        new TokenMatcher( TokenType.Operator, /\*|\/|%/, { operator: new Set( ["multiplicative"] ) } ),
        new TokenMatcher( TokenType.Operator, /<<|>>/, { operator: new Set( ["shift"] ) } ),
        new TokenMatcher( TokenType.Operator, /&&/, { operator: new Set( ["logical and"] ) } ),
        new TokenMatcher( TokenType.Operator, /\^\^/, { operator: new Set( ["logical xor"] ) } ),
        new TokenMatcher( TokenType.Operator, /\|\|/, { operator: new Set( ["logical or"] ) } ),
        new TokenMatcher( TokenType.Operator, /&/, { operator: new Set( ["and"] ) } ),
        new TokenMatcher( TokenType.Operator, /\^/, { operator: new Set( ["xor"] ) } ),
        new TokenMatcher( TokenType.Operator, /\|/, { operator: new Set( ["or"] ) } ),
        new TokenMatcher( TokenType.Operator, /\?/, { operator: new Set( ["conditional"] ) } ),
        new TokenMatcher( TokenType.Operator, /~|!/, { operator: new Set( ["unary"] ) } ),
    ]

    const lexer = new Lexer( Matchers, TokenType.Error, TokenType.EOF, props )
    return lexer
}

module.exports = {
    TokenType,
    GLSLLexer,
}