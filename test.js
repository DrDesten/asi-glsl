const string = `
#define MACRO MACRO_BODY
#define MACRO(MACRO_ARGS) MACRO_BODY

#define MACRO()           \\
    MACRO_BODY            \\
    MACRO_BODY
#define MACRO(MACRO_ARGS) \\
    MACRO_BODY            \\
    MACRO_BODY
`

console.log( "===\n", string )
console.log( "===\n", string.replace( /#.+/g, "" ) )
console.log( "===\n", string.replace( /#(\\\n|.)+/g, "" ) )
console.log( "===\n", string.replace( /#.+|(?<=\\\n).+/g, "" ) )