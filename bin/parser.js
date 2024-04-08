const { GLSLLexer, TokenType } = require( "./lexer.js" )
const { Token } = require( "../lib/lexer.js" )

class Node {}

class Decl extends Node { constructor() { super() } }
class Stmt extends Decl { constructor() { super() } }
class Expr extends Node { constructor() { super() } }

// Declarations

class StructDecl extends Decl {
    constructor( name, members, declarators ) {
        super()
        this.name = name
        this.members = members
        this.declarators = declarators
    }
}
class StructMember extends Node {
    constructor( type, declarators ) {
        super()
        this.type = type
        this.declarators = declarators
    }
}

class InterfaceDecl extends Decl {
    constructor( name, members, declarators ) {
        super()
        this.name = name
        this.members = members
        this.declarators = declarators
    }
}
class InterfaceMember extends Node {
    constructor( type, declarators ) {
        super()
        this.type = type
        this.declarators = declarators
    }
}

class VarDecl extends Decl {
    constructor( decls ) {
        super()
        this.decls = decls
    }
}
class VarDeclSingle extends Node {
    constructor( type, array, ident, initExpr ) {
        super()
        this.type = type
        this.array = array
        this.ident = ident
        this.initExpr = initExpr
    }
}

class FunctionDecl extends Decl {
    constructor( returnType, ident, args, body ) {
        super()
        this.returnType = returnType
        this.ident = ident
        this.args = args
        this.body = body
    }
}
class FunctionArg extends Node {
    constructor( type, ident ) {
        super()
        this.type = type
        this.ident = ident
    }
}

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

class BreakStmt extends Stmt {}
class ContinueStmt extends Stmt {}
class ReturnStmt extends Stmt {
    constructor( expr ) {
        super()
        this.expr = expr
    }
}
class DiscardStmt extends Stmt {}

// Expressions

class SequenceExpr extends Expr {
    constructor( exprs ) {
        super()
        this.exprs = exprs
    }
}

class ConditionalExpr extends Expr {
    constructor( condition, trueExpr, falseExpr ) {
        super()
        this.condition = condition
        this.trueExpr = trueExpr
        this.falseExpr = falseExpr
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

class Edit {
    /** @param {Token} prevToken @param {number} index @param {string} text */
    constructor( prevToken, index, text ) {
        this.prevToken = prevToken
        this.index = index
        this.text = text
    }
}

/** 
 * @param {Token[]} tokens
 **/
function Parse( tokens ) {
    let index = 0

    /** @type {Edit[]} */
    const edits = []
    /** @type {Node[]} */
    const ast = parse()
    return {
        ast: ast,
        edits: edits
    }

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
    function peekStrict( offset = 0 ) {
        return tokens[index + offset]
    }
    /** @param {Token} token @param {...(Symbol|string)} conditions */
    function checkConditions( token, ...conditions ) {
        if ( conditions.length === 0 ) return true
        const symbols = conditions.filter( c => typeof c === "symbol" )
        const strings = conditions.filter( c => typeof c === "string" )
        return ( !symbols.length || symbols.includes( token.type ) ) && ( !strings.length || strings.includes( token.text ) )
    }
    /** @param {...(Symbol|string)} conditions @returns {Token} */
    function advance( ...conditions ) {
        const token = peek()
        if ( !checkConditions( token, ...conditions ) ) {
            let c = [
                conditions.filter( c => typeof c === "symbol" ).map( s => s.toString() ).join( " or " ),
                conditions.filter( c => typeof c === "string" ).map( s => `"${s}"` ).join( " or " )
            ]
            if ( c[0] ) c[0] = "of type " + c[0]
            if ( c[1] ) c[1] = "with text of " + c[1]
            c = c.filter( c => c )

            let message = `\nExpected Token ${c.join( " and " )}\nGot Token of type ${token.type.toString()} and text of "${token.text}"`
            message += `\nAt: l:${token.position.line} c: ${token.position.column}`
            throw new Error( message + "\n" )
        }
        index += calcOffset( 0 )
        index++
        return token
    }
    /** @param {...(Symbol|string)} conditions @returns {Token?} */
    function advanceIf( ...conditions ) {
        if ( checkConditions( peek(), ...conditions ) ) {
            return advance( ...conditions )
        }
        return null
    }

    function expectSemicolon() {
        if ( !advanceIf( TokenType.Semicolon ) ) {
            edits.push( new Edit(
                tokens[index - 1],
                tokens[index - 1].range.end.index,
                ";"
            ) )
        } else {
            while ( advanceIf( TokenType.Semicolon ) ) {}
        }
    }
    function expectLParen() {
        if ( !advanceIf( TokenType.LParen ) ) {
            edits.push( new Edit(
                tokens[index - 1],
                tokens[index].range.start.index,
                "("
            ) )
        }
    }
    function expectRParen() {
        if ( !advanceIf( TokenType.RParen ) ) {
            edits.push( new Edit(
                tokens[index - 1],
                tokens[index - 1].range.end.index,
                ")"
            ) )
        }
    }

    function parse() {
        const program = []
        while ( !eof() ) program.push( parseDecl() )
        return program
    }

    // Declarations

    function parseDecl() {
        /* console.log( calcOffset( 0 ), calcOffset( 1 ), calcOffset( 2 ) )
        console.log( peek(), peek( 1 ), peek( 2 ) ) */
        switch ( peek().type ) {
            case TokenType.EOF: {
                return
            }
            case TokenType.Struct: {
                return parseStructDecl()
            }
            case TokenType.Qualifier: {
                return parseQualifierDecl()
            }
            case TokenType.Layout: {
                return parseLayout()
            }
            case TokenType.Identifier: {
                if ( peek( 1 )?.type === TokenType.Identifier ) {
                    if ( peek( 2 )?.type === TokenType.LParen ) {
                        return parseFunctionDecl()
                    }
                    return parseVarDecl()
                }
                return parseStmt()
            }
            default: {
                return parseStmt()
            }
        }
    }

    function parseQualifiers() {
        const seen = new Set
        const qualifiers = []
        while ( peek().type === TokenType.Qualifier && !seen.has( peek().props.qualifier ) ) {
            const qualifier = advance()
            seen.add( qualifier.props.qualifier )
            qualifiers.push( qualifier )
        }
        return qualifiers
    }

    function parseType() {
        const name = advance( TokenType.Identifier )
        const array = []
        while ( advanceIf( TokenType.LBrack ) ) {
            if ( advanceIf( TokenType.RBrack ) ) {
                array.push( null )
            } else {
                array.push( parseExpr() )
                advance( TokenType.RBrack )
            }
        }
        return { name, array }
    }

    function parseDeclIdentifier() {
        const name = advance( TokenType.Identifier )
        const array = []
        while ( advanceIf( TokenType.LBrack ) ) {
            if ( advanceIf( TokenType.RBrack ) ) {
                array.push( null )
            } else {
                array.push( parseExpr() )
                advance( TokenType.RBrack )
            }
        }
        return { name, array }
    }

    function parseQualifierDecl() {
        parseQualifiers()

        if ( peek().type === TokenType.Struct ) {
            return parseStructDecl()
        }
        if ( peek( 1 ).type === TokenType.LBrace ) {
            return parseInterfaceDecl()
        }
        return parseVarDecl()
    }

    function parseStructDecl() {
        advance( TokenType.Struct )
        const name = advanceIf( TokenType.Identifier )
        advance( TokenType.LBrace )
        const members = []
        while ( !advanceIf( TokenType.RBrace ) ) {
            const type = parseType().name
            const declarators = [parseDeclIdentifier().name]
            while ( advanceIf( TokenType.Comma ) )
                declarators.push( parseDeclIdentifier().name )
            members.push( new StructMember( type, declarators ) )
            expectSemicolon()
        }
        const declarators = []
        if ( peekStrict().type === TokenType.Identifier ) {
            do {
                declarators.push( parseDeclIdentifier() )
            } while ( advanceIf( TokenType.Comma ) )
        }
        expectSemicolon()
        return new StructDecl( name, members, declarators )
    }

    function parseInterfaceDecl() {
        const name = advance( TokenType.Identifier )
        advance( TokenType.LBrace )

        const members = []
        while ( !advanceIf( TokenType.RBrace ) ) {
            parseQualifiers()
            const { name: type } = parseType()
            const declarators = [parseDeclIdentifier().name]
            while ( advanceIf( TokenType.Comma ) )
                declarators.push( parseDeclIdentifier().name )
            members.push( new InterfaceMember( type, declarators ) )
            expectSemicolon()
        }
        const declarators = []
        if ( peekStrict().type === TokenType.Identifier ) {
            do {
                declarators.push( parseDeclIdentifier() )
            } while ( advanceIf( TokenType.Comma ) )
        }
        expectSemicolon()
        return new InterfaceDecl( name, members, declarators )
    }

    function parseVarDecl() {
        // Type
        const { name: type, array: globalArray } = parseType()

        const decls = []
        do {
            const { name, array } = parseDeclIdentifier()

            let initExpr = null
            if ( peek().text === "=" ) {
                advance() // Equals Sign
                initExpr = parseSingleExpr()
            }

            decls.push( new VarDeclSingle( type, globalArray.concat( array ), name, initExpr ) )
        } while ( advanceIf( TokenType.Comma ) )

        expectSemicolon()
        return new VarDecl( decls )
    }

    function parseLayout() {
        advance( TokenType.Layout )
        advance( TokenType.LParen )
        if ( peek().type !== TokenType.RParen ) {
            do {
                advance( TokenType.Identifier )
                if ( advanceIf( "=" ) )
                    parseSingleExpr()
            } while ( advanceIf( TokenType.Comma ) )
        }
        advance( TokenType.RParen )

        parseQualifiers()
        if ( advanceIf( TokenType.Identifier ) /* type */ ) {
            advance( TokenType.Identifier ) // identifier
        }

        expectSemicolon()
    }

    function parseFunctionDecl() {
        const returnType = advance( TokenType.Identifier ) // Return Type
        const ident = advance( TokenType.Identifier ) // Function Name
        advance( TokenType.LParen ) // Opening Parenthesis

        const args = []
        if ( !advanceIf( TokenType.RParen ) ) {
            do {
                parseQualifiers()
                const { name: type } = parseType() // Argument Type
                const { name: ident } = parseDeclIdentifier() // Argument Name
                args.push( new FunctionArg( type, ident ) )
            } while ( advanceIf( TokenType.Comma ) )
            advance( TokenType.RParen ) // Closing Parenthesis
        }

        const body = parseBlock()
        return new FunctionDecl( returnType, ident, args, body )
    }

    // Statements

    function parseStmt() {
        switch ( peek().type ) {
            case TokenType.EOF: return
            case TokenType.LBrace: return parseBlock()
            case TokenType.If: return parseIf()
            case TokenType.Switch: return parseSwitch()
            case TokenType.For: return parseFor()
            case TokenType.While: return parseWhile()
            case TokenType.Do: return parseDoWhile()
            case TokenType.Break: return parseBreak()
            case TokenType.Continue: return parseContinue()
            case TokenType.Return: return parseReturn()
            case TokenType.Discard: return parseDiscard()
            default: {
                const stmt = new ExpressionStmt( parseExpr() )
                expectSemicolon()
                return stmt
            }
        }
    }

    function parseBlock() {
        advance( TokenType.LBrace )
        const stmts = []
        while ( !advanceIf( TokenType.RBrace ) )
            stmts.push( parseDecl() )
        return new BlockStmt( stmts )
    }

    function parseIf() {
        advance( TokenType.If )
        expectLParen()
        const condition = parseExpr()
        expectRParen()

        const ifBlock = parseStmt()
        let elseBlock = null
        if ( advanceIf( TokenType.Else ) ) {
            elseBlock = parseStmt()
        }

        return new IfStmt( condition, ifBlock, elseBlock )
    }

    function parseSwitch() {
        advance( TokenType.Switch )
        expectLParen()
        const switchCondition = parseExpr()
        expectRParen()

        advance( TokenType.LBrace )
        const cases = []
        while ( !advanceIf( TokenType.RBrace ) ) {
            if ( advanceIf( TokenType.Case ) ) {
                const caseCondition = parseExpr()
                advance( TokenType.Colon )

                const body = []
                while ( peek().type !== TokenType.Case && peek().type !== TokenType.Default && peek().type !== TokenType.RBrace ) {
                    body.push( parseStmt() )
                }

                cases.push( new SwitchCase( caseCondition, body ) )
                continue
            }

            advance( TokenType.Default )
            advance( TokenType.Colon )

            const body = []
            while ( peek().type !== TokenType.Case && peek().type !== TokenType.Default && peek().type !== TokenType.RBrace ) {
                body.push( parseStmt() )
            }

            cases.push( new SwitchCase( null, body ) )
        }
        return new SwitchStmt( switchCondition, cases )
    }

    function parseFor() {
        advance( TokenType.For )
        expectLParen()

        let initExpr = null
        if ( peek().type !== TokenType.Semicolon ) {
            initExpr = parseDecl() // parseDecl already expects a semicolon
        } else {
            advance( TokenType.Semicolon )
        }

        let condition = null
        if ( peek().type !== TokenType.Semicolon ) {
            condition = parseExpr()
            expectSemicolon()
        } else {
            advance( TokenType.Semicolon )
        }

        // TODO: handle missing loop expr better
        let loopExpr = null
        if ( !advanceIf( TokenType.RParen ) ) {
            loopExpr = parseExpr()
            expectRParen()
        }

        const body = parseStmt()
        return new ForStmt( initExpr, condition, loopExpr, body )
    }

    function parseWhile() {
        advance( TokenType.While )
        expectLParen()
        const condition = parseExpr()
        expectRParen()
        const body = parseStmt()
        return new WhileStmt( condition, body )
    }

    function parseDoWhile() {
        advance( TokenType.Do )
        const body = parseStmt()
        advance( TokenType.While )
        expectLParen()
        const condition = parseExpr()
        expectRParen()
        expectSemicolon()
        return new DoWhileStmt( condition, body )
    }

    function parseBreak() {
        advance( TokenType.Break )
        expectSemicolon()
        return new BreakStmt()
    }
    function parseContinue() {
        advance( TokenType.Continue )
        expectSemicolon()
        return new ContinueStmt()
    }
    function parseReturn() {
        advance( TokenType.Return )
        let expr = null
        if ( peekStrict().type !== TokenType.Newline ) {
            expr = parseExpr()
        }
        expectSemicolon()
        return new ReturnStmt( expr )
    }
    function parseDiscard() {
        advance( TokenType.Discard )
        expectSemicolon()
        return new DiscardStmt()
    }

    // Expressions

    /** @returns {Expr} */
    function parseExpr() {
        const exprs = []
        do {
            exprs.push( parseSingleExpr() )
        } while ( advanceIf( TokenType.Comma ) )
        return exprs.length === 1 ? exprs[0] : new SequenceExpr( exprs )
    }

    function parseSingleExpr() {
        return parseConditionalExpr()
    }

    function parseConditionalExpr() {
        const condition = parseBinaryExpr()
        if ( advanceIf( TokenType.Operator, "?" ) ) {
            const trueExpr = parseExpr()
            advance( TokenType.Colon )
            return new ConditionalExpr( condition, trueExpr, parseSingleExpr() )
        }
        return condition
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
                    let index = null
                    if ( peek().type !== TokenType.RBrack ) index = parseExpr()
                    advance( TokenType.RBrack )
                    expr = new IndexExpr( expr, index )
                    continue
                case TokenType.LParen:
                    if ( peekStrict().type === TokenType.Newline ) break
                    advance()
                    const args = []
                    if ( peek().type !== TokenType.RParen ) do {
                        args.push( parseSingleExpr() )
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
                    if ( token.props.operator.has( "assignment" ) ) {
                        advance()
                        expr = new BinaryExpr( expr, parseSingleExpr() )
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
}

module.exports = {
    Parse
}