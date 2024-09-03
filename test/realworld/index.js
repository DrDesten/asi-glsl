const root = (...paths) => path.join( __dirname, ...paths )
const trueroot = (...paths) => path.join( __dirname, "../..", ...paths )

const fs = require("fs")
const path = require("path")
const util = require("util")
const { GLSLLexer } = require("../../bin/lexer.js")
const { Parse } = require("../../bin/parser.js")

const file = 1
const paths = ["minimum.glsl", "mintest.glsl", "test.glsl", "maximum.glsl"]

function checkMax() {
    const content = fs.readFileSync(root(paths.at(-1)), "utf8")
    const tokens = GLSLLexer().lex(content)
    const { ast, edits, counts } = Parse( tokens )
    console.info( "Counts:", counts, "Edits:", edits )
}

const LOG = Object.assign( function log( channel, transform ) {
    return function log( ...args ) {
        if ( !channel || LOG.channels.has(channel) ) {
            if (transform) args = args.map(transform)
            const newline = args.some(x => typeof x === "string" && x.includes("\n"))
            newline 
                ? ( console.info( `[${channel}]:` ), console.log( ...args ) )
                : console.info( `[${channel}]:`, ...args )
            
        }
    }
},
{ channels: new Set( [
    "file",
    //"token",
    //"ast",
    "parse",
] ) } )

const lF = LOG("file")
const lT = LOG("token")
const lAst = LOG("ast", x => typeof x === "object" 
    ? util.inspect(x, {compact: true, breakLength: 120, depth: null, colors: true, customInspect: true}) : x 
)
const lP = LOG("parse", x => typeof x === "object" 
    ? util.inspect(x, {compact: true, breakLength: 120, depth: null, colors: true, customInspect: true}) : x 
)

const content = fs.readFileSync(root(paths[file]), "utf8")
lF(content)

const tokens = GLSLLexer().lex(content)
lT(tokens)

const { ast, edits, counts } = Parse( tokens )
lAst(ast)
lP(edits)
lP(counts)


console.info("Running maximum check")
checkMax()