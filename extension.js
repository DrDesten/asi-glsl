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

	let disposable = vscode.languages.registerDocumentFormattingEditProvider( "glsl", {
		provideDocumentFormattingEdits( document ) {

			// Basic ASI (No Semicolon with no preceding content) | Semicolon after structs | Semicolons in single-line curly-brackets '{}' | Semicolons at the end of the string
			//const asi = /((?<!(struct|void|uniform|in|out|varying|(i|u)?(sampler|image)([123]D|Cube|2DRect|[12]DArray|CubeArray|Buffer|2DMS|2DMSArray)(Shadow)?|bool|u?int|float|half|double|(b|i|u|d)?vec[2-4]|d?mat[2-4](x[2-4])?|[{}(\].=?+\-*/%<>!&^|,;\n])\s*?)\n(?=[ \t]*[^ .=?+\-*/%<>!&^|,])|(?<=struct\s+\w+\s+{[^{}]+?})\s(?!\s*;))/g
			const asi = /((?<!(^|struct|void|uniform|in|out|varying|(i|u)?(sampler|image)([123]D|Cube|2DRect|[12]DArray|CubeArray|Buffer|2DMS|2DMSArray)(Shadow)?|bool|u?int|float|half|double|(b|i|u|d)?vec[2-4]|d?mat[2-4](x[2-4])?|[{}(\].=?+\-*/%<>!&^|,;\s]))(?=\s*?\n\s*?[^ .=?+\-*/%<>!&^|,({])|(?<=struct\s+\w+\s+{[^{}]+?})\s(?![\t\f\v \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*[;\w])|(?<=[^\s{]+)(?=\s*})|(?<=\w)(?=\s*$))/g
			const ignore = /\/\/.*|\/\*[^]*?\*\/|#.*/g

			// Replace all areas that should not be parsed with whitspace so that ASI won't match it
			/////////////////////////////////////////////////////////////////////////////////////////////
			let searchString = document.getText().replace( ignore, function ( substr ) { return " ".repeat( substr.length ) } ) // Replace Comments and Preprocessor Directives
			for ( let i = 0, priority = 0; i < searchString.length; i++ ) {                                                     // Replace Content of Parentheses and Brackets '()' and '[]'
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
			let edits = []
			searchString.replace( asi, function () {
				let index = arguments[ arguments.length - 2 ]
				//console.log( index )
				edits.push( vscode.TextEdit.insert( document.positionAt( index ), ";" ) )
			} )

			if ( edits.length > 0 ) vscode.window.showInformationMessage( `Added ${edits.length} Semicolon${"s".repeat( edits.length != 1 )}` )

			return edits
		}
	} )

	context.subscriptions.push( disposable )
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
