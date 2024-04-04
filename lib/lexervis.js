import { Position, Range, Token } from "./lexer.js"
import col from "./colors.js"
import util from "util"

/** @param {string} text @param {Token[]} tokens */
export function visualize( text, tokens ) {
    let colors = [col.FgCyan, col.FgYellow]
    let colorIndex = 0
    let color = () => colors[colorIndex++ % colors.length]

    let pieces = []
    let position = new Position( 0, 1, 1 )
    for ( const token of tokens ) {
        if ( token.position.index !== position.index ) {
            pieces.push( { col: col.underscore, text: text.substring( position.index, token.position.index ) } )
            position = token.position
        }
        pieces.push( { col: color(), text: text.substring( position.index, token.range.end.index ) } )
        position = token.range.end
    }

    return pieces.map( piece => piece.col + piece.text + col.reset ).join( "" )
}