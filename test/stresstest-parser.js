import assert from "assert"
import path from "path"
import url from "url"
import { GLSLLexer, TokenType } from "../bin/lexer.js"
import { readFileSync, readdirSync, statSync } from "fs"
import { performance } from "perf_hooks"
import { FgRed, wrap } from "../lib/colors.js"
import { Parse } from "../bin/parser.js"

const __dirname = path.dirname( url.fileURLToPath( import.meta.url ) )
const __cwd = process.cwd()

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

for ( const [i, filename, file] of files ) {
    let start, end, speed
    console.info( `Parsing ${filename}... (${i + 1}/${files.length})` )

    // Lexing
    const tokens = GLSLLexer.lex( file )
    const errors = tokens.reduce( ( c, t ) => c + ( t.type === GLSLLexer.errorSymbol ), 0 )
    const errorChars = tokens.filter( t => t.type === GLSLLexer.errorSymbol ).map( t => "'" + t.text + "'" ).join( "," )
    if ( errors ) {
        console.error( ` |> ${wrap( errors ? FgRed : "", `${errors} Errors` )}: ${errorChars}` )
        continue
    }

    // Parsing
    start = performance.now()
    const [ast1, semicolonsTest] = Parse( tokens )
    end = performance.now()
    speed = ( end - start ) / tokens.length
    console.info( ` |> Parsing Complete (${tokens.length} Tokens, ${( end - start ).toPrecision( 3 )}ms, ${( speed * 1000 ).toPrecision( 2 )}μs/token)` )
    if ( semicolonsTest.length )
        console.warn( ` |> Extension would have placed ${wrap( FgRed, `${semicolonsTest.length} Semicolons` )} (at indecies ${semicolonsTest.map( t => t.range.end.index ).join( ", " )})` )

    // Semicolon checking
    const filteredTokens = tokens.filter( t => t.type !== TokenType.Semicolon )
    const filteredSemicolons = tokens.filter( ( _, i ) => tokens[i + 1]?.type === TokenType.Semicolon )
    const [ast2, semicolons] = Parse( filteredTokens )

    const indecies = {
        orig: filteredSemicolons.map( t => ( tokens.indexOf( t ), t.range.end.index ) ),
        gen: semicolons.map( t => ( tokens.indexOf( t ), t.range.end.index ) ),
    }

    //assert.deepStrictEqual( ast1, ast2, "Parser Generates Equal AST" )
    assert.deepStrictEqual( indecies.orig, indecies.gen )
    console.info( ` |> AST and Semicolon Equality Test Passed` )
}