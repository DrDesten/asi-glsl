const { TokenType } = require( "./lexer.js" )
const { Token } = require( "../lib/lexer.js" )
const { T } = require( "./glsltype.js" )


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

class BlockStmt extends Stmt {
    constructor( stmts ) {
        super()
        this.stmts = stmts
    }
}
class ExpressionStmt extends Stmt {
    constructor( expr ) {
        super()
        this.expr = expr
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
class InitializerListExpr extends Expr {
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

class AssignmentExpr extends BinaryExpr {}
class LogicalExpr extends BinaryExpr {}
class BitwiseExpr extends BinaryExpr {}
class ComparativeExpr extends BinaryExpr {}
class ArithmeticExpr extends BinaryExpr {}

class UnaryExpr extends Expr {
    constructor( expr ) {
        super()
        this.expr = expr
    }
}

class UnaryArithmeticExpr extends UnaryExpr {}
class UnaryLogicalExpr extends UnaryExpr {}
class UnaryBitwiseExpr extends UnaryExpr {}

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

class IdentifierExpr extends Expr {
    constructor( identifier ) {
        super()
        this.identifier = identifier
    }
}

class LiteralExpr extends Expr {
    constructor( literal ) {
        super()
        this.literal = literal
    }
}

// Visitor

class NodeVisitor {
    /** @param {Node|Node[]} node */
    visit( node ) {
        if ( node instanceof Array ) {
            return node.map( n => this.visit( n ) )
        }
        if ( !( node instanceof Node ) ) {
            throw new Error( "Expected Node, got " + node )
        }

        const method = "visit" + node.constructor.name
        const visitor = this[method]
        if ( visitor ) {
            return visitor.call( this, node )
        } else {
            throw new Error( "No visitor for node " + node.constructor.name )
        }
    }

    visitSequenceExpr( node ) {
        this.visit( node.exprs )
    }

    visitInitializerListExpr( node ) {
        this.visit( node.exprs )
    }

    visitConditionalExpr( node ) {
        this.visit( node.condition )
        this.visit( node.trueExpr )
        this.visit( node.falseExpr )
    }

    visitBinaryExpr( node ) {
        this.visit( node.left )
        this.visit( node.right )
    }
    visitAssignmentExpr( node ) { return this.visitBinaryExpr( node ) }
    visitLogicalExpr( node ) { return this.visitBinaryExpr( node ) }
    visitBitwiseExpr( node ) { return this.visitBinaryExpr( node ) }
    visitShiftExpr( node ) { return this.visitBinaryExpr( node ) }
    visitComparativeExpr( node ) { return this.visitBinaryExpr( node ) }
    visitArithmeticExpr( node ) { return this.visitBinaryExpr( node ) }

    visitUnaryExpr( node ) {
        this.visit( node.expr )
    }
    visitUnaryArithmeticExpr( node ) { return this.visitUnaryExpr( node ) }
    visitUnaryLogicalExpr( node ) { return this.visitUnaryExpr( node ) }
    visitUnaryBitwiseExpr( node ) { return this.visitUnaryExpr( node ) }

    visitCallExpression( node ) {
        this.visit( node.callee )
        this.visit( node.args )
    }

    visitAccessExpr( node ) {
        this.visit( node.target )
    }

    visitIndexExpr( node ) {
        this.visit( node.target )
        this.visit( node.expr )
    }

    visitIdentifierExpr( node ) {}
    visitLiteralExpr( node ) {}
}

class TypeVisitor extends NodeVisitor {
    static typeof( node ) {
        const visitor = new TypeVisitor()
        visitor.visit( node )
        return visitor.types.get( node )
    }

    constructor() {
        super()
        /** @type {Map<Node, T>} */
        this.types = new WeakMap
    }

    visitSequenceExpr( node ) {
        this.visit( node.exprs.at( -1 ) )
        const type = this.types.get( node.exprs.at( -1 ) )
        this.types.set( node, type )
    }
    visitInitializerListExpr( node ) {
        this.types.set( node, T.Error )
    }

    visitConditionalExpr( node ) {
        this.visit( node.trueExpr )
        this.visit( node.falseExpr )
        const trueType = this.types.get( node.trueExpr )
        const falseType = this.types.get( node.falseExpr )
        const type = T.implicitCommonType( trueType, falseType )
        this.types.set( node, type )
    }

    visitAssignmentExpr( node ) {
        this.types.set( node, T.Error )
    }
    visitLogicalExpr( node ) {
        this.types.set( node, T.Bool )
    }
    visitBitwiseExpr( node ) {
        this.visit( node.left )
        this.visit( node.right )
        const leftType = this.types.get( node.left )
        const rightType = this.types.get( node.right )
        const type = T.implicitCommonType( leftType, rightType )
        this.types.set( node, type.underlyingType.isInteger() ? type : T.Error )
    }
    visitShiftExpr( node ) {
        this.visit( node.left )
        this.visit( node.right )
        const leftType = this.types.get( node.left )
        const rightType = this.types.get( node.right )
        const type = leftType.underlyingType.isInteger() && rightType.underlyingType.isInteger() ? leftType : T.Error
        this.types.set( node, type )
    }
    visitComparativeExpr( node ) {
        this.types.set( node, T.Bool )
    }
    visitArithmeticExpr( node ) {
        this.visit( node.left )
        this.visit( node.right )
        const leftType = this.types.get( node.left )
        const rightType = this.types.get( node.right )
        const type = T.implicitCommonType( leftType, rightType )
        this.types.set( node, type.underlyingType.isNumeric() ? type : T.Error )
    }

    visitUnaryArithmeticExpr( node ) {
        this.visit( node.expr )
        const type = this.types.get( node.expr )
        this.types.set( node, type.underlyingType.isNumeric() ? type : T.Error )
    }
    visitUnaryLogicalExpr( node ) {
        this.visit( node.expr )
        const type = this.types.get( node.expr )
        this.types.set( node, type === T.Bool ? type : T.Error )
    }
    visitUnaryBitwiseExpr( node ) {
        this.visit( node.expr )
        const type = this.types.get( node.expr )
        this.types.set( node, type.underlyingType.isInteger() ? type : T.Error )
    }

    visitCallExpression( node ) {
        const ident = node.callee
        // Constructor Call
        if ( ident instanceof IdentifierExpr && /^bool|u?int|float|double|[biu]?vec[234]|d?mat[234](x[234])?$/.test( ident.identifier.text ) ) {
            this.types.set( node, T.new( ident.identifier.text ) )
            return
        }
        this.types.set( node, T.Error )
    }
    visitAccessExpr( node ) {
        this.types.set( node, T.Error )
    }
    visitIndexExpr( node ) {
        this.types.set( node, T.Error )
    }

    visitIdentifierExpr( node ) {
        this.types.set( node, T.Error )
    }
    visitLiteralExpr( node ) {
        const token = node.literal
        const type = token.type === TokenType.Literal
            ? token.props.type
            : null
        this.types.set( node, T.new( type ) )
    }
}


// Hints

class Hint {
    constructor( type ) {

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

const TokenText = {
    [TokenType.Semicolon]: ";",
    [TokenType.Colon]: ":",
    [TokenType.Comma]: ",",
    [TokenType.ParenOpen]: "(",
    [TokenType.ParenClose]: ")",
    [TokenType.BrackOpen]: "[",
    [TokenType.BrackClose]: "]",
    [TokenType.BraceOpen]: "{",
    [TokenType.BraceClose]: "}",
}

/** 
 * Parses a Token Stream produced by Lexer
 * REQUIRES Newlines to be merged
 * 
 * @param {Token<string>[] & { text: string }} tokens
 * @param {Object} options
 * @param {boolean} options.addSemicolons
 * @param {boolean} options.addInlineSemicolons
 * @param {boolean} options.addColons
 * @param {boolean} options.addParentheses
 * @param {boolean} options.addCommas
 * @param {boolean} options.addExplicitTypeConversions
 **/
function Parse( tokens, options = new Proxy( {}, { get: () => true } ) ) {
    let index = 0

    const {
        addSemicolons,
        addInlineSemicolons,
        addColons,
        addParentheses,
        addCommas,
        addExplicitTypeConversions,
    } = options

    /** @type {{[key: string]: () => boolean}} */
    const expectFilter = {
        ":"() { return addColons },
        "("() { return addParentheses },
        ")"() { return addParentheses },
        ","() { return addCommas },
    }

    /** @type {Map<string,number>} */
    const Counts = new Map
    Counts.inc = function ( key ) { this.set( key, ( this.get( key ) ?? 0 ) + 1 ) }

    /** @type {Edit[]} */
    const edits = []
    /** @type {Node[]} */
    const ast = parse()
    return {
        ast: ast,
        edits: edits,
        counts: Counts
    }

    function warn( ...args ) { console.warn( ...args ) }

    function eof() {
        let i = index
        while ( tokens[i].type === TokenType.Newline ) i++
        return tokens[i].type === TokenType.EOF
    }
    function calcOffset( count ) {
        return count >= 0 ? calcPositiveOffset( count ) : calcNegativeOffset( count )
    }
    function calcPositiveOffset( count ) {
        let offset = 0
        while ( !eof() ) {
            // Skip newline
            if ( tokens[index + offset].type === TokenType.Newline ) offset++
            // Next token can't be a newline, check `count`
            if ( count ) count--, offset++
            else break
        }
        return offset
    }
    function calcNegativeOffset( count ) {
        let offset = 0
        if ( tokens[index].type === TokenType.Newline ) count++, offset--
        while ( index + offset >= 0 ) {
            // Skip newline
            if ( tokens[index + offset].type === TokenType.Newline ) offset--
            // Previous token can't be a newline, check `count`
            if ( count ) count++, offset--
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
    /** @param {Token} token @param {...string} conditions */
    function checkCondition( token, ...conditions ) {
        if ( conditions.length === 0 ) return true
        return conditions.includes( token.type )
    }
    /** @param {...string} conditions @returns {Token} */
    function advance( ...conditions ) {
        const token = peek()
        if ( !checkCondition( token, ...conditions ) ) {
            let { line, column } = token.position
            let message = `Expected Token of type(s) ${conditions.join( " and " )}\n`
                + `Got Token of type ${token.type.toString()} and text of "${token.text}"\n`
                + `At: l:${line} c: ${column}\n\n`

            let lines = tokens.text.split( /\r?\n/g )
            if ( lines[line - 2] !== undefined ) message += ` | ${lines[line - 2]}\n`
            if ( lines[line - 1] !== undefined ) message += ` > ${lines[line - 1]}\n`
            if ( lines[line + 0] !== undefined ) message += ` | ${lines[line + 0]}\n`
            throw new Error( message )
        }
        index += calcOffset( 0 )
        index++
        return token
    }
    /** @param {...string} conditions @returns {Token?} */
    function advanceIf( ...conditions ) {
        if ( checkCondition( peek(), ...conditions ) ) {
            return advance()
        }
        return null
    }

    /** @param {keyof (typeof TokenText)} token */
    function expect( token ) {
        if ( advanceIf( token ) ) return null
        if ( expectFilter[token]?.() ?? true ) {
            const text = TokenText[token]
            if ( !text ) throw new Error( `No Text for Token: ${token}` )

            Counts.inc( text )
            const edit = new Edit(
                tokens[index - 1],
                tokens[index - 1].range.end.index,
                text
            )
            edits.push( edit )
            return edit
        }
        return null
    }
    /** @param {Edit?} edit */
    function undoExpect( edit ) {
        if ( !edit ) return
        const idx = edits.indexOf( edit )
        if ( idx === -1 ) return
        edits.splice( idx, 1 )
    }
    function expectSemicolon() {
        if ( advanceIf( TokenType.Semicolon ) ) {
            while ( advanceIf( TokenType.Semicolon ) ) {}
            return
        }
        if ( addSemicolons && ( peekStrict().type === TokenType.Newline || addInlineSemicolons ) ) {
            edits.push( new Edit(
                tokens[index - 1],
                tokens[index - 1].range.end.index,
                ";"
            ) )
            Counts.inc( ";" )
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
                    if ( peek( 2 )?.type === TokenType.ParenOpen ) {
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
        while ( advanceIf( TokenType.BrackOpen ) ) {
            array.push( parseExpr() )
            expect( TokenType.BrackClose )
        }
        return { name, array }
    }

    function parseDeclIdentifier() {
        const name = advance( TokenType.Identifier )
        const array = []
        while ( advanceIf( TokenType.BrackOpen ) ) {
            array.push( parseExpr() )
            expect( TokenType.BrackClose )
        }
        return { name, array }
    }

    function parseQualifierDecl() {
        parseQualifiers()

        if ( peek().type === TokenType.Struct ) {
            return parseStructDecl()
        }
        if ( peek( 1 ).type === TokenType.BraceOpen ) {
            return parseInterfaceDecl()
        }
        return parseVarDecl()
    }

    function parseStructDecl() {
        advance( TokenType.Struct )
        const name = advanceIf( TokenType.Identifier )
        advance( TokenType.BraceOpen )
        const members = []
        while ( !advanceIf( TokenType.BraceClose ) ) {
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
        advance( TokenType.BraceOpen )

        const members = []
        while ( !advanceIf( TokenType.BraceClose ) ) {
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
            const finalArray = globalArray.concat( array )

            let initExpr = null
            if ( peek().text === "=" ) {
                advance() // Equals Sign
                const start = peek()
                initExpr = parseInitializerExpr()

                if ( addExplicitTypeConversions && finalArray.length === 0 ) {
                    const exprType = TypeVisitor.typeof( initExpr )
                    const expectedType = T.new( type.text )
                    if ( !exprType.implicitConvertableTo( expectedType ) && exprType.explicitConvertableTo( expectedType ) ) {
                        const end = peek( -1 )
                        edits.push( new Edit( start, start.range.start.index, `${expectedType.identifier()}(` ) )
                        edits.push( new Edit( end, end.range.end.index, `)` ) )
                        Counts.inc( "type" )
                    }
                }
            }

            decls.push( new VarDeclSingle( type, finalArray, name, initExpr ) )
        } while ( advanceIf( TokenType.Comma ) )

        expectSemicolon()
        return new VarDecl( decls )
    }

    function parseLayout() {
        advance( TokenType.Layout )
        advance( TokenType.ParenOpen )
        if ( peek().type !== TokenType.ParenClose ) {
            do {
                advance( TokenType.Identifier )
                if ( peek().text === "=" ) {
                    advance()
                    parseAssignmentExpr()
                }
            } while ( advanceIf( TokenType.Comma ) )
        }
        advance( TokenType.ParenClose )

        parseQualifiers()
        if ( advanceIf( TokenType.Identifier ) /* type */ ) {
            advance( TokenType.Identifier ) // identifier
        }

        expectSemicolon()
    }

    function parseFunctionDecl() {
        const returnType = advance( TokenType.Identifier ) // Return Type
        const ident = advance( TokenType.Identifier ) // Function Name
        advance( TokenType.ParenOpen ) // Opening Parenthesis

        const args = []
        if ( !advanceIf( TokenType.ParenClose ) ) {
            do {
                parseQualifiers()
                const { name: type } = parseType() // Argument Type
                const { name: ident } = parseDeclIdentifier() // Argument Name
                args.push( new FunctionArg( type, ident ) )
            } while ( advanceIf( TokenType.Comma ) )
            advance( TokenType.ParenClose ) // Closing Parenthesis
        }

        const body = parseBlock()
        return new FunctionDecl( returnType, ident, args, body )
    }

    // Statements

    function parseStmt() {
        switch ( peek().type ) {
            case TokenType.EOF: return
            case TokenType.BraceOpen: return parseBlock()
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
                const expr = parseExpr()
                if ( !expr ) {
                    const token = advance()
                    warn( "Skipping Token", token )
                }
                const stmt = new ExpressionStmt( expr )
                expectSemicolon()
                return stmt
            }
        }
    }

    function parseBlock() {
        advance( TokenType.BraceOpen )
        const stmts = []
        while ( peek().type !== TokenType.BraceClose ) {
            const decl = parseDecl()
            if ( decl === undefined ) break
            stmts.push( decl )
        }
        advance( TokenType.BraceClose )
        return new BlockStmt( stmts )
    }

    function parseIf() {
        advance( TokenType.If )
        expect( TokenType.ParenOpen )
        const condition = parseExpr()
        expect( TokenType.ParenClose )

        const ifBlock = parseStmt()
        let elseBlock = null
        if ( advanceIf( TokenType.Else ) ) {
            elseBlock = parseStmt()
        }

        return new IfStmt( condition, ifBlock, elseBlock )
    }

    function parseSwitch() {
        advance( TokenType.Switch )
        expect( TokenType.ParenOpen )
        const switchCondition = parseExpr()
        expect( TokenType.ParenClose )

        advance( TokenType.BraceOpen )
        const cases = []
        while ( !advanceIf( TokenType.BraceClose ) ) {
            if ( advanceIf( TokenType.Case ) ) {
                const caseCondition = parseExpr()
                expect( TokenType.Colon )

                const body = []
                while ( peek().type !== TokenType.Case && peek().type !== TokenType.Default && peek().type !== TokenType.BraceClose ) {
                    body.push( parseStmt() )
                }

                cases.push( new SwitchCase( caseCondition, body ) )
                continue
            }

            advance( TokenType.Default )
            expect( TokenType.Colon )

            const body = []
            while ( peek().type !== TokenType.Case && peek().type !== TokenType.Default && peek().type !== TokenType.BraceClose ) {
                body.push( parseStmt() )
            }

            cases.push( new SwitchCase( null, body ) )
        }
        return new SwitchStmt( switchCondition, cases )
    }

    function parseFor() {
        advance( TokenType.For )
        expect( TokenType.ParenOpen )

        let initExpr = null
        if ( !advanceIf( TokenType.Semicolon ) ) {
            initExpr = parseDecl() // parseDecl already expects a semicolon
        }

        let condition = null
        if ( !advanceIf( TokenType.Semicolon ) ) {
            condition = parseExpr()
            expectSemicolon()
        }

        let loopExpr = parseExpr()
        expect( TokenType.ParenClose )

        const body = parseStmt()
        return new ForStmt( initExpr, condition, loopExpr, body )
    }

    function parseWhile() {
        advance( TokenType.While )
        expect( TokenType.ParenOpen )
        const condition = parseExpr()
        expect( TokenType.ParenClose )
        const body = parseStmt()
        return new WhileStmt( condition, body )
    }

    function parseDoWhile() {
        advance( TokenType.Do )
        const body = parseStmt()
        advance( TokenType.While )
        expect( TokenType.ParenOpen )
        const condition = parseExpr()
        expect( TokenType.ParenClose )
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
        if ( peek().type !== TokenType.Semicolon && peekStrict().type !== TokenType.Newline ) {
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

    function parseInitializerExpr() {
        if ( peek().type === TokenType.BraceOpen ) {
            return parseInitializerList()
        }
        return parseAssignmentExpr()
    }

    function parseInitializerList() {
        advance( TokenType.BraceOpen )
        const exprs = []
        while ( peek().type !== TokenType.BraceClose ) {
            exprs.push( parseInitializerExpr() )
            if ( peek().type !== TokenType.BraceClose ) {
                advance( TokenType.Comma )
            }
        }
        advanceIf( TokenType.Comma )
        advance( TokenType.BraceClose )
        return new InitializerListExpr( exprs )
    }

    /** @returns {Expr?} */
    function parseExpr() {
        const exprs = []
        do {
            exprs.push( parseAssignmentExpr() )
        } while ( advanceIf( TokenType.Comma ) )
        //if (exprs.every(x=>x===null)) throw new Error()
        return exprs.length === 1 ? exprs[0] : new SequenceExpr( exprs )
    }

    function parseAssignmentExpr() {
        return parseConditionalExpr()
    }

    function parseConditionalExpr() {
        const condition = parseLogicalOrExpr()
        if ( peek().type === TokenType.Operator && peek().props.operator.has( "conditional" ) ) {
            advance( TokenType.Operator )
            const trueExpr = parseExpr()
            expect( TokenType.Colon )
            return new ConditionalExpr( condition, trueExpr, parseAssignmentExpr() )
        }
        return condition
    }

    function parseLogicalOrExpr() {
        let left = parseLogicalXorExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "logical or" ) ) {
            advance( TokenType.Operator )
            left = new LogicalExpr( left, parseLogicalXorExpr() )
        }
        return left
    }

    function parseLogicalXorExpr() {
        let left = parseLogicalAndExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "logical xor" ) ) {
            advance( TokenType.Operator )
            left = new LogicalExpr( left, parseLogicalAndExpr() )
        }
        return left
    }

    function parseLogicalAndExpr() {
        let left = parseOrExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "logical and" ) ) {
            advance( TokenType.Operator )
            left = new LogicalExpr( left, parseOrExpr() )
        }
        return left
    }

    function parseOrExpr() {
        let left = parseXorExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "or" ) ) {
            advance( TokenType.Operator )
            left = new BitwiseExpr( left, parseXorExpr() )
        }
        return left
    }

    function parseXorExpr() {
        let left = parseAndExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "xor" ) ) {
            advance( TokenType.Operator )
            left = new BitwiseExpr( left, parseAndExpr() )
        }
        return left
    }

    function parseAndExpr() {
        let left = parseEqualityExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "and" ) ) {
            advance( TokenType.Operator )
            left = new BitwiseExpr( left, parseEqualityExpr() )
        }
        return left
    }

    function parseEqualityExpr() {
        let left = parseRelationalExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "equality" ) ) {
            advance( TokenType.Operator )
            left = new ComparativeExpr( left, parseRelationalExpr() )
        }
        return left
    }

    function parseRelationalExpr() {
        let left = parseShiftExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "relational" ) ) {
            advance( TokenType.Operator )
            left = new ComparativeExpr( left, parseShiftExpr() )
        }
        return left
    }

    function parseShiftExpr() {
        let left = parseAdditiveExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "shift" ) ) {
            advance( TokenType.Operator )
            left = new BitwiseExpr( left, parseAdditiveExpr() )
        }
        return left
    }

    function parseAdditiveExpr() {
        let left = parseMultiplicativeExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "additive" ) ) {
            advance( TokenType.Operator )
            left = new ArithmeticExpr( left, parseMultiplicativeExpr() )
        }
        return left
    }

    function parseMultiplicativeExpr() {
        let left = parseUnaryExpr()
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "multiplicative" ) ) {
            advance( TokenType.Operator )
            left = new ArithmeticExpr( left, parseUnaryExpr() )
        }
        return left
    }

    function parseUnaryExpr() {
        const operators = []
        while ( !eof() && peek().type === TokenType.Operator && peek().props.operator.has( "unary" ) ) {
            operators.push( advance( TokenType.Operator ) )
        }
        let expr = parsePostfixExpr()
        for ( const operator of operators.reverse() ) {
            switch ( operator.text ) {
                case "+":
                case "-":
                case "++":
                case "--":
                    expr = new UnaryArithmeticExpr( expr ); break
                case "!":
                    expr = new UnaryLogicalExpr( expr ); break
                case "~":
                    expr = new UnaryBitwiseExpr( expr ); break
                default:
                    expr = new UnaryExpr( expr )
            }
        }

        if ( peek().type === TokenType.Operator && peek().props.operator.has( "assignment" ) ) {
            advance( TokenType.Operator )
            expr = new AssignmentExpr( expr, parseAssignmentExpr() )
        }
        return expr
    }

    function parsePostfixExpr() {
        let expr = parseLiteralExpr()
        while ( !eof() ) {
            const token = peek()
            switch ( token.type ) {
                case TokenType.Dot: {
                    advance( TokenType.Dot )
                    const property = advance( TokenType.Identifier )
                    expr = new AccessExpr( expr, property )
                    continue
                }
                case TokenType.BrackOpen: {
                    advance( TokenType.BrackOpen )
                    const indexexpr = parseExpr()
                    expect( TokenType.BrackClose )
                    expr = new IndexExpr( expr, indexexpr )
                    continue
                }
                case TokenType.ParenOpen: {
                    // Call needs to start on the same line
                    if ( peekStrict().type === TokenType.Newline ) break
                    advance( TokenType.ParenOpen )

                    // Call with no arguments
                    if ( advanceIf( TokenType.ParenClose ) ) {
                        expr = new CallExpression( expr, [] )
                        continue
                    }

                    // Call with arguments
                    const callargs = []
                    let lastComma = null
                    while ( true ) {
                        const argexpr = parseAssignmentExpr()
                        if ( !argexpr ) {
                            undoExpect( lastComma )
                            expect( TokenType.ParenClose )
                            break
                        }
                        callargs.push( argexpr )
                        if ( advanceIf( TokenType.ParenClose ) ) break
                        lastComma = expect( TokenType.Comma )
                    }
                    expr = new CallExpression( expr, callargs )
                    continue
                }
                case TokenType.Operator: {
                    if ( token.props.operator.has( "postfix" ) ) {
                        advance()
                        expr = new UnaryArithmeticExpr( expr )
                        continue
                    }
                }
            }
            break
        }
        return expr
    }

    function parseLiteralExpr() {
        if ( advanceIf( TokenType.ParenOpen ) ) {
            const expr = parseExpr()
            expect( TokenType.ParenClose )
            return expr
        }

        const token = advanceIf( TokenType.Literal, TokenType.Identifier )
        if ( !token ) return null

        return token.type === TokenType.Literal
            ? new LiteralExpr( token )
            : new IdentifierExpr( token )
    }
}

module.exports = {
    Parse
}