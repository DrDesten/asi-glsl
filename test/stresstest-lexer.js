const assert = require( "assert" )
const path = require( "path" )
const { CustomGLSLLexer, GLSLLexer } = require( "../bin/lexer.js" )
const { readFileSync, readdirSync, statSync } = require( "fs" )
const { performance } = require( "perf_hooks" )
const { FgRed, wrap } = require( "../lib/colors.js" )

const pathArg = process.argv[2]
assert( pathArg, "No path argument provided." )
const targetDir = path.resolve( path.normalize( pathArg ) )

const filePaths = readdirSync( targetDir )
    .map( p => path.join( targetDir, p ) )
    .filter( p => statSync( p ).isFile() )
    .filter( p => /\.(vsh|fsh|gsh|tsh|csh|glsl)$/.test( p ) )
const fileContents = filePaths.map( path => readFileSync( path ).toString() )
const files = filePaths.map( /** @returns {[number, string, string]} */( p, i ) => [i, path.basename( p ), fileContents[i]] )

console.info( `Read ${filePaths.length} files.` )
console.info( `[ ${filePaths.map( p => path.basename( p ) ).join( ", " )} ]` )

// Lexing

const lexer = CustomGLSLLexer( { postprocess: false } )

for ( const [i, filename, file] of files ) {
    let start, end, speed
    console.info( `Lexing ${filename}... (${i + 1}/${files.length})` )

    start = performance.now()
    const tokens = lexer.lex( file )
    end = performance.now()
    speed = ( end - start ) / file.length
    console.info( ` |> ${tokens.length} Tokens (${( end - start ).toPrecision( 3 )}ms, ${( speed * 1000 ).toPrecision( 2 )}μs/char)` )

    const rebuilt = tokens.map( t => t.text ).join( "" )
    const integrity = rebuilt === file
    const errors = tokens.reduce( ( c, t ) => c + ( t.type === lexer.errorSymbol ), 0 )
    const errorChars = tokens.filter( t => t.type === lexer.errorSymbol ).map( t => "'" + t.text + "'" ).join( "," )
    console.info( ` |> ${wrap( !integrity ? FgRed : "", `integrity: ${integrity}` )}, ${wrap( errors ? FgRed : "", `${errors} Errors` )} ${errorChars}` )
}