// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require( 'vscode' )

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate( context ) {

	console.log( '"asi-glsl" is online' )

	let formatter = vscode.languages.registerDocumentFormattingEditProvider( "glsl", {
		provideDocumentFormattingEdits( document ) {

			let edits = []
			const addSemicolons = vscode.workspace.getConfiguration( "asi-glsl" ).get( "addSemicolons" )
			const addArgParentheses = vscode.workspace.getConfiguration( "asi-glsl" ).get( "addArgumentParentheses" )
			const lazyFor = vscode.workspace.getConfiguration( "asi-glsl" ).get( "lazyFor" )

			// Basic ASI (No Semicolon with no preceding content) | Semicolon after structs | Semicolons in single-line curly-brackets '{}' | Semicolons at the end of the string
			//const asi = /((?<!(struct|void|uniform|in|out|varying|(i|u)?(sampler|image)([123]D|Cube|2DRect|[12]DArray|CubeArray|Buffer|2DMS|2DMSArray)(Shadow)?|bool|u?int|float|half|double|(b|i|u|d)?vec[2-4]|d?mat[2-4](x[2-4])?|[{}(\].=?+\-*/%<>!&^|,;\n])\s*?)\n(?=[ \t]*[^ .=?+\-*/%<>!&^|,])|(?<=struct\s+\w+\s+{[^{}]+?})\s(?!\s*;))/g
			const asi = /((?<!(^|struct|void|uniform|in|out|varying|(i|u)?(sampler|image)([123]D|Cube|2DRect|[12]DArray|CubeArray|Buffer|2DMS|2DMSArray)(Shadow)?|atomic_uint|bool|u?int|float|half|double|(b|i|u|d)?vec[2-4]|d?mat[2-4](x[2-4])?|[{}(\].=?+\-*/%<>!&^|,;\s]))(?=\s*?\n\s*?[^ .=?+\-*/%<>!&^|,({])|(?<=struct\s+\w+\s+{[^{}]+?})(?![\t\f\v \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*[;\w])|(?<=[^\s{};]+)(?=\s*})|(?<=\w)(?=\s*$))/g
			const argparentheses = /(?<=(if|for) +(?! |\())[^\n\r{}]*?(?=(?<!\) *) *{)/g
			const lazyfor = /(?<=for *\(|for +) *((\w*) +)?(\w+) *([<>=!]{1,2}) *(\w+) *?(?=\)| *{)/g
			const ignore = /\/\/.*|\/\*[^]*?\*\/|#.*/g

			// Replace all comments and preprocessor directives with whitspace so that ASI won't match it
			/////////////////////////////////////////////////////////////////////////////////////////////
			let searchString = document.getText().replace( ignore, function ( substr ) { return " ".repeat( substr.length ) } )

			// Add parentheses around if and for statements
			/////////////////////////////////////////////////////////////////////////////////////////////
			if ( addArgParentheses ) {
				let count = 0
				searchString = searchString.replace( argparentheses, function () {

					let startindex = arguments[ arguments.length - 2 ]
					let endindex = startindex + arguments[ 0 ].length

					edits.push( vscode.TextEdit.insert( document.positionAt( startindex ), "(" ) )
					edits.push( vscode.TextEdit.insert( document.positionAt( endindex ), ")" ) )
					count++

					return arguments[ 0 ]
				} )

				//if ( count > 0 ) vscode.window.showInformationMessage( `Added parentheses to ${count} if or for statement${"s".repeat( count != 1 )}` )
			}

			// Lazy for
			/////////////////////////////////////////////////////////////////////////////////////////////
			if ( true ) {
				let count = 0
				searchString = searchString.replace( lazyfor, function () {

					let startindex = arguments[ arguments.length - 2 ]
					let endindex = startindex + arguments[ 0 ].length

					let vartype = "int"
					if ( arguments[ 2 ] != undefined ) vartype = arguments[ 2 ]

					edits.push( vscode.TextEdit.replace( new vscode.Range( document.positionAt( startindex ), document.positionAt( endindex ) ), `${vartype} ${arguments[ 3 ]} = 0; ${arguments[ 3 ]} ${arguments[ 4 ]} ${arguments[ 5 ]}; ${arguments[ 3 ]}++` ) )
					count++

					return arguments[ 0 ]
				} )

				//if ( count > 0 ) vscode.window.showInformationMessage( `Added parentheses to ${ifs} if-statement${"s".repeat( count != 1 )}` )
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
					let index = arguments[ arguments.length - 2 ]
					//console.log( index )
					edits.push( vscode.TextEdit.insert( document.positionAt( index ), ";" ) )
					count++
				} )

				if ( count > 0 ) vscode.window.showInformationMessage( `Added ${count} Semicolon${"s".repeat( count != 1 )}` )
			}

			return edits
		}
	} )

	context.subscriptions.push( formatter )
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
