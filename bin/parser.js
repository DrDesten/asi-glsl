import { GLSLLexer, TokenType } from "./lexer.js"
import { Token } from "../lib/lexer.js"

/** @param {Token[]} tokens  */
export function Parse( tokens ) {
    let index = 0
    let semicolons = []
    let commas = []

    function eof() {
        let i = index
        while ( tokens[i].type === TokenType.Newline ) i++
        return tokens[i].type === TokenType.EOF
    }
    function calcOffset( count ) {
        let offset = 0
        while ( !eof() && tokens[index + offset].type === TokenType.Newline ) offset++
        while ( !eof() && count ) count -= tokens[index + offset++].type !== TokenType.Newline
        return offset
    }

    function peek( offset = 0 ) {
        return tokens[index + calcOffset( offset )]
    }
    function advance( ...types ) {
        const token = peek()
        if ( types.length && !types.includes( token.type ) ) {
            throw new Error( `Expected ${types.join( ' or ' )}, got ${token.type}` )
        }
        index += calcOffset( 0 )
        index++
        return token
    }
    function advanceIf( ...types ) {
        if ( !eof() && types.includes( peek().type ) ) {
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
        while ( !eof() ) parseStmt()
    }
    function parseStmt() {
        switch ( peek().type ) {
            case TokenType.EOF:
                return
            case TokenType.LBrace:
                return parseBlock()
            case TokenType.Identifier:
                if ( peek( 1 )?.type === TokenType.Identifier ) {
                    if ( peek( 2 )?.type === TokenType.LParen )
                        return parseFunctionDecl()
                    return parseVarDecl(), expectSemicolon()
                }
                return parseExpr(), expectSemicolon()
            case TokenType.VarDeclPrefix:
                return parseVarDecl(), expectSemicolon()
            default:
                return parseExpr(), expectSemicolon()
        }
    }

    function parseBlock() {
        advance( TokenType.LBrace )
        while ( !advanceIf( TokenType.RBrace ) ) parseStmt()
    }

    function parseVarDecl() {
        while ( advanceIf( TokenType.VarDeclPrefix ) );
        advance( TokenType.Identifier ) // Type

        do {
            advance( TokenType.Identifier ) // Variable name
            if ( advanceIf( TokenType.LBrack ) ) {
                advance( TokenType.Literal )
                advance( TokenType.RBrack )
            }
        } while ( advanceIf( TokenType.Comma ) )

        if ( peek().text === "=" ) {
            advance() // Equals Sign
            parseExpr()
        }
    }

    function parseFunctionDecl() {
        advance( TokenType.Identifier ) // Return Type
        advance( TokenType.Identifier ) // Function Name
        advance( TokenType.LParen ) // Opening Parenthesis

        if ( !advanceIf( TokenType.RParen ) ) {
            parseExpr()
            while ( advanceIf( TokenType.Comma ) ) parseExpr()
            advance( TokenType.RParen ) // Closing Parenthesis
        }

        advance( TokenType.LBrace ) // Opening Brace
        while ( advanceIf( TokenType.Identifier ) ) {
            parseStmt()
        }
    }

    function parseExpr() {
        parseBinaryExpr()
        while ( advanceIf( TokenType.Comma ) ) parseBinaryExpr()
    }

    function parseBinaryExpr() {
        parsePrefixExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "binary" ) ) {
            advance( TokenType.Operator )
            parsePrefixExpr()
        }
    }

    function parsePrefixExpr() {
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "prefix" ) ) {
            advance( TokenType.Operator )
        }
        parsePostfixExpr()
    }

    function parsePostfixExpr() {
        parseLiteralExpr()
        while ( !eof() ) {
            const token = peek()
            switch ( token.type ) {
                case TokenType.Dot:
                    advance()
                    advance( TokenType.Identifier )
                    continue
                case TokenType.LBrack:
                    advance()
                    parseExpr()
                    advance( TokenType.RBrack )
                    continue
                case TokenType.LParen:
                    advance()
                    parseExpr()
                    while ( advanceIf( TokenType.Comma ) ) parseExpr()
                    advance( TokenType.RParen )
                    continue
                case TokenType.Operator:
                    if ( token.props.operator.has( "postfix" ) ) {
                        advance()
                        continue
                    }
            }
            break
        }
    }

    function parseLiteralExpr() {
        if ( advanceIf( TokenType.LParen ) ) {
            parseExpr()
            advance( TokenType.RParen )
            return
        }
        advance( TokenType.Literal, TokenType.Identifier )
    }

    parse()
    return semicolons.map( index => tokens[index - 1] )
}