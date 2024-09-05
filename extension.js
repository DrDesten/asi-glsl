
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require( 'vscode' )
const { GLSLLexer } = require( './bin/lexer.js' )
const { Parse } = require( './bin/parser.js' )

// Basic ASI (no semicolon with no preceding content, no semicolons after variable declarators, no semicolons after operators and brackets) | Semicolon after structs | Semicolons in single-line curly-brackets '{}'
const asi = /(?<!^|struct|void|uniform|in|out|varying|(i|u)?(sampler|image)([123]D|Cube|2DRect|[12]DArray|CubeArray|Buffer|2DMS|2DMSArray)(Shadow)?|atomic_uint|bool|u?int|float|half|double|(b|i|u|d)?vec[2-4]|d?mat[2-4](x[2-4])?|[{}(\].=+\-*/%<>!&^|:?,;\s])(?=\s*?\n\s*?[^ .=?+\-*/%<>!&^|,({]|\s*$)|(?<=struct\s+\w+\s+{[^{}]+?})(?![^\S\n]*[;\w])|(?<=[^\s{};]+)(?=\s*})/g
const argparentheses = /(?<=(if|for) +(?! |\())[^\n\r{}]*?(?=(?<!\) *) *{)|(?<=if +)!?[\w.][\w.()]*( *[<>!=|&]{1,2} *!?[\w.][\w.()]*)*(?= +[A-z_])/g
const lazyfor = /(?<=for +|for *\( *)([\w.]+) *?([\w.]+)? *?([<>!=]{1,2})? *?([\w.]+)?(?= *\)? *{)/g
const lazyconstructors = /(?<=((?:u|i)?(?:mat|vec)\d(?:x\d)?)\s+\w+\s*=\s*)(?:\d+\.?\d*|\.\d+)(?:e\d+)?/g
const ignore = /\/\/.*|\/\*[^]*?\*\/|#(\\\r?\n|.)+/g

/**
 * this method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 * @param {vscode.ExtensionContext} context
 */
function activate( context ) {

    console.info( '"asi-glsl" is online' )

    const registeredFormatter = vscode.languages.registerDocumentFormattingEditProvider( "glsl", {
        provideDocumentFormattingEdits: formatter
    } )

    context.subscriptions.push( registeredFormatter )
}

// this method is called when your extension is deactivated
function deactivate() {}

////////////////////////////////////////////////////////////////////////////////

/** @param {vscode.TextDocument} document @returns {vscode.TextEdit[]} */
function formatter( document ) {
    const config = vscode.workspace.getConfiguration( "asi-glsl" )
    const useLegacyRegex = config.get( "useLegacyRegex" )
    const addSemicolons = config.get( "addSemicolons" )
    const addInlineSemicolons = config.get( "addInlineSemicolons" )
    const addColons = config.get( "addColons" )
    const addParentheses = config.get( "addParentheses" )
    const addExplicitTypeConversions = config.get( "addExplicitTypeConversions" )
    const addArgParentheses = config.get( "addArgumentParentheses" )
    const lazyFor = config.get( "lazyFor" )
    const lazyConstructors = config.get( "lazyConstructors" )

    if ( useLegacyRegex ) {
        return legacyRegex( document )
    }

    const edits = []
    const documentText = document.getText()

    const options = {
        addSemicolons,
        addInlineSemicolons,
        addColons,
        addParentheses,
        addCommas: false,
        addExplicitTypeConversions
    }

    try {

        const lexer = GLSLLexer()
        const tokens = lexer.lex( documentText )
        const { edits: parserEdits, counts } = Parse( tokens, options )
        console.log( parserEdits )

        const names = {
            ";": ["Semicolon", "Semicolons"],
            type: ["Explicit Type Conversion", "Explicit Type Conversions"]
        }
        for ( const edit of parserEdits ) {
            edits.push( vscode.TextEdit.insert( document.positionAt( edit.index ), edit.text ) )
        }

        {
            const namedResults = Object.entries( names )
                .filter( ( [key] ) => counts.has( key ) )
                .map( ( [key, name, count = counts.get( key )] ) => `${count} ${name[+( count !== 1 )]}` )
            const namedMessage = namedResults.length
                ? "added " + ( namedResults.length === 1
                    ? namedResults[0]
                    : namedResults.slice( 0, -1 ).join( ", " ) + " and " + namedResults.at( -1 ) )
                : ""

            const otherNames = namedMessage ? ["other change", "other changes"] : ["change", "changes"]
            const otherResult = [...counts.entries()]
                .filter( ( [key] ) => !( key in names ) )
                .reduce( ( sum, [, value] ) => sum + value, 0 )
            const otherMessage = otherResult
                ? `made ${otherResult} ${otherNames[+( otherResult !== 1 )]}`
                : ""

            let message = [namedMessage, otherMessage].filter( Boolean ).join( ", " )
            message = "ASI: " + message[0].toUpperCase() + message.slice( 1 )
            vscode.window.showInformationMessage( message )
        }

    } catch ( e ) {

        console.error( e )
        vscode.window.showErrorMessage( `ASI for GLSL failed to parse file and/or edits.` )

    }

    return edits
}

function legacyRegex( document ) {
    const edits = []
    const documentText = document.getText()

    const config = vscode.workspace.getConfiguration( "asi-glsl" )
    const useLegacyRegex = config.get( "useLegacyRegex" )
    const addSemicolons = config.get( "addSemicolons" )
    const addInlineSemicolons = config.get( "addInlineSemicolons" )
    const addColons = config.get( "addColons" )
    const addParentheses = config.get( "addParentheses" )
    const addExplicitTypeConversions = config.get( "addExplicitTypeConversions" )
    const addArgParentheses = config.get( "addArgumentParentheses" )
    const lazyFor = config.get( "lazyFor" )
    const lazyConstructors = config.get( "lazyConstructors" )

    // Replace all comments and preprocessor directives with whitespace so that ASI won't match it
    /////////////////////////////////////////////////////////////////////////////////////////////
    let searchString = documentText.replace( ignore, substr => " ".repeat( substr.length ) )

    // Add parentheses around if and for statements
    /////////////////////////////////////////////////////////////////////////////////////////////
    if ( addArgParentheses ) {
        //let count = 0
        searchString.replace( argparentheses, function ( match, ...args ) {

            let startindex = args[args.length - 2]
            let endindex = startindex + match.length

            edits.push( vscode.TextEdit.insert( document.positionAt( startindex ), "(" ) )
            edits.push( vscode.TextEdit.insert( document.positionAt( endindex ), ")" ) )
            //count++
        } )

        //if ( count > 0 ) vscode.window.showInformationMessage( `Added ${count} parenthese${"s".repeat( count != 1 )}` )
    }

    if ( lazyConstructors ) {
        //let count = 0
        searchString.replace( lazyconstructors, function ( match, ...args ) {

            let startindex = args[args.length - 2]
            let endindex = startindex + match.length

            edits.push( vscode.TextEdit.insert( document.positionAt( startindex ), args[0] + "(" ) )
            edits.push( vscode.TextEdit.insert( document.positionAt( endindex ), ")" ) )
            //count++
        } )
    }

    // Lazy for
    /////////////////////////////////////////////////////////////////////////////////////////////
    if ( lazyFor ) {
        //let count = 0
        searchString.replace( lazyfor, function ( match, ...args ) {

            let startindex = args[args.length - 2]
            let endindex = startindex + match.length
            const replaceRange = new vscode.Range( document.positionAt( startindex ), document.positionAt( endindex ) )

            const match1 = args[0] // Variable Type, Name, or interation Count
            const match2 = args[1] // Variable Name if type is specified
            const match3 = args[2] // Operator
            const match4 = args[3] // Interation Count if Variable Name is specified


            let replaceString = ""
            if ( match1 && !match2 && !match3 && !match4 ) {
                replaceString = `int i = 0; i < ${match1}; i++` // Extra-Lazy for: for x {}
            } else if ( match1 && !match2 && match3 && match4 ) {
                replaceString = `int ${match1} = 0; ${match1} ${match3} ${match4}; ${match1}++` // Lazy for: for i < x {}
            } else if ( match1 && match2 && match3 && match4 ) {
                replaceString = `${match1} ${match2} = 0; ${match2} ${match3} ${match4}; ${match2}++` // Lazy for: for i < x {}
            }

            if ( replaceString != "" ) {
                edits.push( vscode.TextEdit.replace( replaceRange, replaceString ) )
                //count++
            }

        } )

        //if ( count > 0 ) vscode.window.showInformationMessage( `${count}x Lazy-For` )
    }

    // Replace Content of Parentheses and Brackets ( '()' and '[]' ) with whitspace so that ASI won't match it
    /////////////////////////////////////////////////////////////////////////////////////////////
    for ( let i = 0, priority = 0; i < searchString.length; i++ ) {
        let char = searchString.slice( i, i + 1 )
        if ( char == ")" || char == "]" ) priority--
        if ( priority > 0 ) searchString = searchString.slice( 0, i ) + " " + searchString.slice( i + 1 )
        if ( char == "(" || char == "[" ) priority++
    }

    // Insert Semicolons at the correct locations
    /*////////////////////////////////////////////////////////////////////////////////////////////
    Here I hijack the str.replace function:
    The function I pass in doesn't actually change the string, but modifies the original string. 
    arguments[arguments.length - 2] corresponds to the index, which matches because I replaced all unparsed code with whitespace and didn't delete it.
    Since all insertions happen at once, I do not need to keep track of the size increase of the string.
    The semicolon has to be inserted at the match. I use lookahead and lookbehind, so all matches are null.
    The edits array hold all TextEdit objects that will be returned by the function
    */
    if ( addSemicolons ) {
        let count = 0
        searchString.replace( asi, function () {
            let index = arguments[arguments.length - 2]
            //console.log( index )
            edits.push( vscode.TextEdit.insert( document.positionAt( index ), ";" ) )
            count++
        } )

        if ( count > 0 ) vscode.window.showInformationMessage( `Added ${count} Semicolon${"s".repeat( count != 1 )}` )
    }

    return edits
}

module.exports = {
    activate,
    deactivate
}