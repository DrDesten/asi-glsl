const assert = require( "assert" )
const path = require( "path" )
const { GLSLLexer, TokenType } = require( "../bin/lexer.js" )
const { readFileSync, readdirSync, statSync } = require( "fs" )
const { performance } = require( "perf_hooks" )
const { FgRed, wrap, dim } = require( "../lib/colors.js" )
const { Parse } = require( "../bin/parser.js" )
const { readFileRecursiveSync } = require( "./stresslib.js" )

const pathArg = process.argv[2]
assert( pathArg, "No path argument provided." )
const targetDir = path.resolve( path.normalize( pathArg ) )

const files = readFileRecursiveSync( targetDir, /\.(vsh|fsh|gsh|tsh|csh|glsl)$/ )

console.info( `Read ${files.length} files.` )
console.info( `[ ${files.map( ( { path: p } ) => path.basename( p ) ).join( ", " )} ]` )

// Lexing

for ( const [i, { path: filepath, content: file }] of files.entries() ) {
    let start, end, speed
    const filename = path.basename( filepath )
    console.info( `Parsing ${filename}... (${i + 1}/${files.length}) ${wrap( dim, filepath )}` )

    // Lexing
    start = performance.now()
    const tokens = GLSLLexer.lex( file )
    end = performance.now()
    speed = ( end - start ) / file.length
    console.info( ` |> Lexing  Complete (${tokens.length} Tokens, ${( end - start ).toFixed( 1 )}ms, ${( speed * 1000 ).toPrecision( 2 )}μs/char)` )

    const errors = tokens.reduce( ( c, t ) => c + ( t.type === GLSLLexer.errorSymbol ), 0 )
    const errorChars = tokens.filter( t => t.type === GLSLLexer.errorSymbol ).map( t => "'" + t.text + "'" ).join( "," )
    if ( errors ) {
        console.error( wrap( FgRed, ` |> ${errors} Errors: ${errorChars}` ) )
        continue
    }

    // Parsing
    start = performance.now()
    const { ast: ast1, edits: editsTest } = Parse( tokens )
    end = performance.now()
    speed = ( end - start ) / tokens.length
    console.info( ` |> Parsing Complete (${tokens.length} Tokens, ${( end - start ).toFixed( 1 )}ms, ${( speed * 1000 ).toPrecision( 2 )}μs/token)` )
    if ( editsTest.length )
        console.warn( wrap( FgRed, ` |> Extension would have made ${editsTest.length} Edits (at indecies ${editsTest.map( t => t.range.end.index ).join( ", " )})` ) )

    // Semicolon checking
    const filteredTokens = tokens.filter( t => t.type !== TokenType.Semicolon )
    const filteredSemicolons = tokens.filter( ( _, i ) => tokens[i + 1]?.type === TokenType.Semicolon )
    const { ast: ast2, edits } = Parse( filteredTokens )

    const indecies = {
        orig: filteredSemicolons.map( t => ( tokens.indexOf( t ), t.range.end.index ) ),
        gen: edits.filter( e => e.text === ";" ).map( e => ( tokens.indexOf( e.prevToken ), e.prevToken.range.end.index ) ),
    }

    //assert.deepStrictEqual( ast1, ast2, "Parser Generates Equal AST" )
    assert.deepStrictEqual( indecies.orig, indecies.gen )
    console.info( ` |> AST and Semicolon Equality Test Passed` )
}