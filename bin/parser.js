import { GLSLLexer, TokenType } from "./lexer.js"
import { Token } from "../lib/lexer.js"

/** @param {Token[]} tokens  */
export function Parse( tokens ) {
    let index = 0
    let semicolons = []

    function stepNL( chars ) {
        while ( advanceIf( TokenType.Newline ) );
        while ( chars ) chars -= advance().type !== TokenType.Newline
    }
    function peek( offset = 0 ) {
        let i = index
        stepNL( offset )
        let t = tokens[index]
        index = i
        return t
    }
    function advance( ...types ) {
        if ( types.length && !types.includes( peek().type ) ) {
            throw new Error( `Expected ${types.join( ' or ' )}, got ${peek().type}` )
        }
        return tokens[index++]
    }
    function advanceIf( ...types ) {
        if ( types.includes( peek().type ) ) {
            advance( ...types )
            return true
        }
        return false
    }

    function expectSemicolon() {
        if ( !advanceIf( TokenType.Semicolon ) ) {
            semicolons.push( index )
        }
    }

    function parse() {
        return parseStmt()
    }
    function parseStmt() {
        switch ( peek().type ) {
            case TokenType.Identifier:
                return parseToplevelIdent()
            case TokenType.VarDeclPrefix:
                return parseVarDecl()
            default:
                return parseExpr()
        }
    }

    function parseToplevelIdent() {
        if ( peek( 1 )?.type !== TokenType.Identifier ) {
            return parseExpr()
        }
        if ( peek( 2 )?.type === TokenType.Identifier ) {
            return parseVarDecl()
        }
        if ( peek( 2 )?.type === TokenType.LParen ) {
            return parseFunctionDecl()
        }
        return parseExpr()
    }

    function parseVarDecl() {
        while ( peek().type === TokenType.VarDeclPrefix ) advance()
        advance( TokenType.Identifier ) // Type
        advance( TokenType.Identifier ) // Variable name

        if ( advanceIf( TokenType.LBrack ) ) {
            advance( TokenType.Literal )
            advance( TokenType.RBrack )
        }

        if ( advanceIf( TokenType.Assign ) ) {
            parseExpr()
        }

        expectSemicolon()
    }


    return semicolons
}

