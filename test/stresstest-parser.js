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

    let message = ""

    // Lexing
    const lexer = GLSLLexer()
    start = performance.now()
    const tokens = lexer.lex( file )
    end = performance.now()
    speed = ( end - start ) / file.length
    message += ` |> Lexing: (${tokens.length} Tokens, ${( end - start ).toFixed( 1 )}ms, ${( speed * 1000 ).toPrecision( 2 )}μs/char)`

    const errors = tokens.reduce( ( c, t ) => c + ( t.type === lexer.errorSymbol ), 0 )
    const errorChars = tokens.filter( t => t.type === lexer.errorSymbol ).map( t => "'" + t.text + "'" ).join( "," )
    if ( errors ) {
        console.info( message )
        console.error( wrap( FgRed, ` |> ${errors} Errors: ${errorChars}` ) )
        continue
    }

    // Parsing
    try {
        start = performance.now()
        const { ast: ast1, edits: editsTest } = Parse( tokens )
        end = performance.now()
        speed = ( end - start ) / tokens.length
        message += `; Parsing: (${( end - start ).toFixed( 1 )}ms, ${( speed * 1000 ).toPrecision( 2 )}μs/token)`
        if ( editsTest.length ) {
            message += wrap( FgRed, `\n |> Extension would have made ${editsTest.length} Edits (at indecies ${editsTest.map( t => t.range.end.index ).join( ", " )})` )
        }

        // Semicolon checking
        const filteredTokens = tokens.filter( t => t.type !== TokenType.Semicolon )
        const filteredSemicolons = tokens.filter( ( _, i, arr ) => arr[i + 1]?.type === TokenType.Semicolon )
        const { ast: ast2, edits } = Parse( filteredTokens )

        const textIndecies = {
            orig: filteredSemicolons.map( t => t.range.end.index ),
            gen: edits.filter( e => e.text === ";" ).map( e => e.prevToken.range.end.index ),
        }
        const tokenIdecies = {
            orig: filteredSemicolons.map( t => {
                let index = tokens.indexOf( t )
                while ( tokens[index].type === TokenType.Newline ) index--
                return index
            } ),
            gen: edits.filter( e => e.text === ";" ).map( e => {
                let index = tokens.indexOf( e.prevToken )
                while ( tokens[index].type === TokenType.Newline ) index--
                return index
            } ),
        }

        try {
            //assert.deepStrictEqual( ast1, ast2, "Parser Generates Equal AST" )
            assert.deepStrictEqual( tokenIdecies.orig, tokenIdecies.gen )
        } catch ( e ) {
            console.info( message )
            message = ""
            console.error( e )
            assert.deepStrictEqual( textIndecies.orig, textIndecies.gen )
        }

    } catch ( e ) {
        if ( message ) {
            console.info( message )
            message = ""
        }
        console.error( wrap( FgRed, ` |> Failed to Parse File` ) )
        console.error( e )
    }

    if ( message ) {
        console.info( message )
    }
}