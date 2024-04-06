import { GLSLLexer, TokenType } from "./lexer.js"
import { Token } from "../lib/lexer.js"

class Node {}

class Stmt extends Node { constructor() { super() } }
class Expr extends Node { constructor() { super() } }

// Statements

class ExpressionStmt extends Stmt {
    constructor( expr ) {
        super()
        this.expr = expr
    }
}
class BlockStmt extends Stmt {
    constructor( stmts ) {
        super()
        this.stmts = stmts
    }
}
class IfStmt extends Stmt {
    constructor( condition, ifBlock, elseBlock ) {
        super()
        this.condition = condition
        this.ifBlock = ifBlock
        this.elseBlock = elseBlock
    }
}
class SwitchStmt extends Stmt {
    constructor( condition, cases ) {
        super()
        this.condition = condition
        this.cases = cases
    }
}
class SwitchCase extends Node {
    constructor( condition, stmts ) {
        super()
        this.condition = condition
        this.stmts = stmts
    }
}
class ForStmt extends Stmt {
    constructor( initExpr, condition, loopExpr, block ) {
        super()
        this.initExpr = initExpr
        this.condition = condition
        this.loopExpr = loopExpr
        this.block = block
    }
}
class WhileStmt extends Stmt {
    constructor( condition, block ) {
        super()
        this.condition = condition
        this.block = block
    }
}
class DoWhileStmt extends Stmt {
    constructor( condition, block ) {
        super()
        this.condition = condition
        this.block = block
    }
}

// Expressions

class SequenceExpr extends Expr {
    constructor( exprs ) {
        super()
        this.exprs = exprs
    }
}

class BinaryExpr extends Expr {
    constructor( left, right ) {
        super()
        this.left = left
        this.right = right
    }
}

class UnaryExpr extends Expr {
    constructor( expr ) {
        super()
        this.expr = expr
    }
}

class LiteralExpr extends Expr {
    constructor( literal ) {
        super()
        this.literal = literal
    }
}

class CallExpression extends Expr {
    constructor( callee, args ) {
        super()
        this.callee = callee
        this.args = args
    }
}

class AccessExpr extends Expr {
    constructor( target, property ) {
        super()
        this.target = target
        this.property = property
    }
}

class IndexExpr extends Expr {
    constructor( target, expr ) {
        super()
        this.target = target
        this.expr = expr
    }
}


// Parser

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
        while ( !eof() ) {
            // Skip all newlines
            if ( tokens[index + offset].type === TokenType.Newline ) {
                offset++
                continue
            }
            // Next token isn't a newline, check `count`
            if ( count ) count--, offset++
            else break
        }
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
        } else {
            while ( advanceIf( TokenType.Semicolon ) ) {}
        }
    }

    function parse() {
        while ( !eof() ) parseStmt()
    }
    function parseStmt() {
        /* console.log( calcOffset( 0 ), calcOffset( 1 ), calcOffset( 2 ) )
        console.log( peek(), peek( 1 ), peek( 2 ) ) */
        switch ( peek().type ) {
            case TokenType.EOF: {
                return
            }
            case TokenType.LBrace: {
                return parseBlock()
            }
            case TokenType.If: {
                return parseIf()
            }
            case TokenType.Switch: {
                return parseSwitch()
            }
            case TokenType.For: {
                return parseFor()
            }
            case TokenType.While: {
                return parseWhile()
            }
            case TokenType.Do: {
                return parseDoWhile()
            }
            case TokenType.Identifier: {
                if ( peek( 1 )?.type === TokenType.Identifier ) {
                    if ( peek( 2 )?.type === TokenType.LParen ) {
                        return parseFunctionDecl()
                    }
                    const stmt = parseVarDecl()
                    expectSemicolon()
                    return stmt
                }
                const stmt = new ExpressionStmt( parseExpr() )
                expectSemicolon()
                return stmt
            }
            case TokenType.VarDeclPrefix: {
                const stmt = parseVarDecl()
                expectSemicolon()
                return stmt
            }
            default: {
                const stmt = new ExpressionStmt( parseExpr() )
                expectSemicolon()
                return stmt
            }
        }
    }

    function parseBlock() {
        advance( TokenType.LBrace )
        while ( !advanceIf( TokenType.RBrace ) ) parseStmt()
    }

    function parseIf() {
        advance( TokenType.If )
        advance( TokenType.LParen )
        const condition = parseExpr()
        advance( TokenType.RParen )

        const ifBlock = parseStmt()
        let elseBlock = null
        if ( advanceIf( TokenType.Else ) ) {
            elseBlock = parseStmt()
        }

        return new IfStmt( condition, ifBlock, elseBlock )
    }

    function parseSwitch() {
        advance( TokenType.Switch )
        advance( TokenType.LParen )
        const switchCondition = parseExpr()
        advance( TokenType.RParen )

        advance( TokenType.LBrace )
        const cases = []
        while ( !advanceIf( TokenType.RBrace ) ) {
            if ( advanceIf( TokenType.Case ) ) {
                const caseCondition = parseExpr()
                advance( TokenType.Colon )

                const body = []
                while ( !advanceIf( TokenType.Case ) && !advanceIf( TokenType.Default ) && !advanceIf( TokenType.RBrace ) ) {
                    body.push( parseStmt() )
                }

                cases.push( new SwitchCase( caseCondition, body ) )
            }
            if ( advanceIf( TokenType.Default ) ) {
                advance( TokenType.Colon )

                const body = []
                while ( !advanceIf( TokenType.RBrace ) ) {
                    body.push( parseStmt() )
                }

                cases.push( new SwitchCase( null, body ) )
            }
        }
        return new SwitchStmt( switchCondition, cases )
    }

    function parseFor() {
        advance( TokenType.For )
        advance( TokenType.LParen )
        let initExpr = null
        if ( !advanceIf( TokenType.Semicolon ) ) {
            initExpr = parseExpr()
            expectSemicolon()
        }
        let condition = null
        if ( !advanceIf( TokenType.Semicolon ) ) {
            condition = parseExpr()
            expectSemicolon()
        }
        let loopExpr = null
        if ( !advanceIf( TokenType.RParen ) ) {
            loopExpr = parseExpr()
            advance( TokenType.RParen )
        }
        const body = parseStmt()
        return new ForStmt( initExpr, condition, loopExpr, body )
    }

    function parseWhile() {
        advance( TokenType.While )
        advance( TokenType.LParen )
        const condition = parseExpr()
        advance( TokenType.RParen )
        const body = parseStmt()
        return new WhileStmt( condition, body )
    }

    function parseDoWhile() {
        advance( TokenType.Do )
        const body = parseStmt()
        advance( TokenType.While )
        advance( TokenType.LParen )
        const condition = parseExpr()
        advance( TokenType.RParen )
        expectSemicolon()
        return new DoWhileStmt( condition, body )
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

            if ( peek().text === "=" ) {
                advance() // Equals Sign
                parseExpr()
            }
        } while ( advanceIf( TokenType.Comma ) )
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

    /** @returns {Expr} */
    function parseExpr() {
        const exprs = []
        do {
            exprs.push( parseBinaryExpr() )
        } while ( advanceIf( TokenType.Comma ) )
        return exprs.length === 1 ? exprs[0] : new SequenceExpr( exprs )
    }

    function parseBinaryExpr() {
        let left = parsePrefixExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "binary" ) ) {
            advance( TokenType.Operator )
            left = new BinaryExpr( left, parsePrefixExpr() )
        }
        return left
    }

    function parsePrefixExpr() {
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "prefix" ) ) {
            advance( TokenType.Operator )
        }
        return parsePostfixExpr()
    }

    function parsePostfixExpr() {
        let expr = parseLiteralExpr()
        while ( !eof() ) {
            const token = peek()
            switch ( token.type ) {
                case TokenType.Dot:
                    advance()
                    const property = advance( TokenType.Identifier )
                    expr = new AccessExpr( expr, property )
                    continue
                case TokenType.LBrack:
                    advance()
                    const index = parseExpr()
                    advance( TokenType.RBrack )
                    expr = new IndexExpr( expr, index )
                    continue
                case TokenType.LParen:
                    advance()
                    const args = []
                    if ( peek().type !== TokenType.RParen ) do {
                        args.push( parseExpr() )
                    } while ( advanceIf( TokenType.Comma ) )
                    advance( TokenType.RParen )
                    expr = new CallExpression( expr, args )
                    continue
                case TokenType.Operator:
                    if ( token.props.operator.has( "postfix" ) ) {
                        advance()
                        expr = new UnaryExpr( expr )
                        continue
                    }
            }
            break
        }
        return expr
    }

    function parseLiteralExpr() {
        if ( advanceIf( TokenType.LParen ) ) {
            const expr = parseExpr()
            advance( TokenType.RParen )
            return expr
        }
        return new LiteralExpr( advance( TokenType.Literal, TokenType.Identifier ) )
    }

    parse()
    return semicolons.map( index => tokens[index - 1] )
}