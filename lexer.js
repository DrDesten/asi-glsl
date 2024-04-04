export class Position {
    /** @param {number} index @param {number} line @param {number} column */
    constructor( index, line, column ) {
        this.index = index
        this.line = line
        this.column = column
    }

    clone() {
        return new Position( this.index, this.line, this.column )
    }
}

export class Token {
    constructor( name, text, position ) {
        this.name = name
        this.text = text
        this.position = position
    }
}

export class Lexer {
    constructor( text ) {
        this.tokens = []
        this.text = text
        this.pos = new Position( 0, 1, 1 )
    }

    advance() {
        this.pos.index++
        if ( this.text[this.pos.index] === '\n' ) {
            this.pos.line++
            this.pos.column = 1
        } else {
            this.pos.column++
        }
    }

    next() {
        switch ( this.text[this.pos.index] ) {
            case '+':
                this.advance()
                return new Token( '+', new Position( this.index, 1, 1 ) )
        }
    }
}

export class RegLexer {
    constructor() {
        /** @type {Array<{regex: RegExp, name: string}>} */
        this.rules = []
    }

    /** @param {RegExp} regex @param {string} name */
    addRule( regex, name ) {
        this.rules.push( { regex, name } )
        return this
    }

    /** @param {string} text  */
    lex( text ) {
        const tokens = []
        let remaining = text
        let position = new Position( 0, 1, 1 )

        while ( remaining.length ) {
            const matches = []
            for ( const rule of this.rules ) {
                const match = rule.regex.exec( remaining )
                if ( match && match.index === 0 )
                    matches.push( { match, name: rule.name } )
            }
            if ( matches.length === 0 ) {
                console.error( "Unable to match Token on:", remaining.slice( 0, 15 ) + ( remaining.length >= 15 ? "..." : "" ) )
                remaining = remaining.slice( 1 )
                continue
            }
            const match = matches.sort( ( a, b ) => b.match[0].length - a.match[0].length )[0]
            const token = new Token( match.name, match.match[0], position.clone() )

            position.index += match.match[0].length
            for ( const char of match.match[0] ) {
                if ( char === '\n' ) {
                    position.line++
                    position.column = 1
                } else {
                    position.column++
                }
            }

            remaining = remaining.slice( match.match[0].length )
            tokens.push( token )
        }

        return tokens.filter( t => !["Whitespace", "Comment"].includes( t.name ) )
    }
}

export class GLSLLexer extends RegLexer {
    constructor() {
        super()
        this
            .addRule( /#.*\n?/, "Preprocessor" )
            .addRule( /\/\/.*\n?|\/\*[^]*?\*\//, "Comment" )
            .addRule( /[\r\t\f\v \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/, "Whitespace" )
            .addRule( /\n+/, "Newline" )

            .addRule( /const|uniform|in|out|flat|smooth|noperspective/, "VarDeclPrefix" )

            .addRule( /if/, "If" )
            .addRule( /else/, "Else" )
            .addRule( /for/, "For" )
            .addRule( /while/, "While" )

            .addRule( /0b[01]+|0x[0-9a-fA-F]+|(\d+|\.\d+|\d+\.|\d+\.\d+)([eE][+-]?\d+)?/, "Literal" )
            .addRule( /[a-zA-Z_$][a-zA-Z_$0-9]*/, "Identifier" )

            .addRule( /:/, "Colon" )
            .addRule( /;/, "Semicolon" )
            .addRule( /,/, "Comma" )

            .addRule( /\(/, "Lparen" )
            .addRule( /\)/, "Rparen" )
            .addRule( /{/, "Lbrace" )
            .addRule( /}/, "Rbrace" )
            .addRule( /\[/, "Lbrack" )
            .addRule( /\]/, "Rbrack" )

            .addRule( /(\+|\-|\*|\/|%|\^|&|\||<<|>>)=/, "Assign" )
            .addRule( /(=|!|>|<)=|>>?|<<?|&&?|\|\|?|\^|\+|-|\*|\/|%/, "Binary" )
            .addRule( /~|!/, "Prefix" )
            .addRule( /\+\+|--/, "Bothfix" )
    }
}