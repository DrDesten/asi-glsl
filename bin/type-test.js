const assert = require( "assert" )
const { Type, error, void_, bool, int, uint, float, double, bvec2, bvec3, bvec4, ivec2, ivec3, ivec4, uvec2, uvec3, uvec4, vec2, vec3, vec4, dvec2, dvec3, dvec4, add, sub, mul, div } = require( "./type.js" )

const ERR = "\x1b[31mERROR\x1b[0m" // Red text
const OK = "\x1b[32mOK\x1b[0m   "     // Green text


// Test Function
function test( value, instance, message ) {
    test.tests++
    try {
        assert( value instanceof instance, message )
        return true
    } catch ( error ) {
        console.log( ERR, error.message, "| Expected:", instance.name, "| Actual:", value?.constructor.name )
        test.errors++
        return false
    }
}
test.start = function ( message ) {
    test.current = message
    test.tests = 0
    test.errors = 0
}
test.end = function () {
    if ( test.errors > 0 ) {
        console.log( ERR, test.current, "|", test.errors, "errors in", test.tests, "tests" )
    } else {
        console.log( OK, test.current, "|", test.tests, "tests" )
    }
}

// Call fn with all possible arrangements of args
function perm( fn, ...args ) {
    // Helper function to generate permutations
    function generatePermutations( arr, current = [] ) {
        if ( arr.length === 0 ) {
            return fn( ...current ) // Call fn with the current permutation
        }
        for ( let i = 0; i < arr.length; i++ ) {
            const next = arr.slice() // Copy the array
            const [item] = next.splice( i, 1 ) // Remove the i-th element
            generatePermutations( next, current.concat( item ) )
        }
    }
    generatePermutations( args )
}


test.start( "Constructors" )
test( new void_, void_, "new void_ -> void_" )
test( new bool, bool, "new bool -> bool" )
test( new int, int, "new int -> int" )
test( new uint, uint, "new uint -> uint" )
test( new float, float, "new float -> float" )
test( new double, double, "new double -> double" )
test( new bvec2, bvec2, "new bvec2 -> bvec2" )
test( new bvec3, bvec3, "new bvec3 -> bvec3" )
test( new bvec4, bvec4, "new bvec4 -> bvec4" )
test( new ivec2, ivec2, "new ivec2 -> ivec2" )
test( new ivec3, ivec3, "new ivec3 -> ivec3" )
test( new ivec4, ivec4, "new ivec4 -> ivec4" )
test( new uvec2, uvec2, "new uvec2 -> uvec2" )
test( new uvec3, uvec3, "new uvec3 -> uvec3" )
test( new uvec4, uvec4, "new uvec4 -> uvec4" )
test( new vec2, vec2, "new vec2 -> vec2" )
test( new vec3, vec3, "new vec3 -> vec3" )
test( new vec4, vec4, "new vec4 -> vec4" )
test( new dvec2, dvec2, "new dvec2 -> dvec2" )
test( new dvec3, dvec3, "new dvec3 -> dvec3" )
test( new dvec4, dvec4, "new dvec4 -> dvec4" )
test.end()

test.start( "Void Arithmetic" )
for ( const op of [add, sub, mul, div] ) {
    for ( const type of [void_, bool, int, uint, float, double, bvec2, bvec3, bvec4, ivec2, ivec3, ivec4, uvec2, uvec3, uvec4, vec2, vec3, vec4, dvec2, dvec3, dvec4] ) {
        // Void cant do arithmetic
        let a = new void_, b = new type
        test( op( a, b ), error, `${op.name}(${a}, ${b}) -> error` )
        test( op( b, a ), error, `${op.name}(${a}, ${b}) -> error` )
    }
}
test.end()

test.start( "Bool Arithmetic" )
for ( const op of [add, sub, mul, div] ) {
    for ( const type of [void_, bool, int, uint, float, double, bvec2, bvec3, bvec4, ivec2, ivec3, ivec4, uvec2, uvec3, uvec4, vec2, vec3, vec4, dvec2, dvec3, dvec4] ) {
        // Bool cant do arithmetic
        let a = new bool, b = new type
        test( op( a, b ), error, `${op.name}(${a}, ${b}) -> error` )
        test( op( b, a ), error, `${op.name}(${a}, ${b}) -> error` )
    }
}
test.end()

test.start( "Scalar Arithmetic" )
for ( const op of [add, sub, mul, div] ) {

    // Same Types
    for ( const type of [int, uint, float, double] ) {
        let a = new type, b = new type
        test( op( a, b ), type, `${op.name}(${a}, ${b}) -> ${a}` )
    }

    // Promotions
    perm( ( a, b ) => test( op( a, b ), uint, `${op.name}(${a}, ${b}) -> uint` ), new int, new uint )
    perm( ( a, b ) => test( op( a, b ), float, `${op.name}(${a}, ${b}) -> float` ), new int, new float )
    perm( ( a, b ) => test( op( a, b ), double, `${op.name}(${a}, ${b}) -> double` ), new int, new double )

    perm( ( a, b ) => test( op( a, b ), float, `${op.name}(${a}, ${b}) -> float` ), new uint, new float )
    perm( ( a, b ) => test( op( a, b ), double, `${op.name}(${a}, ${b}) -> double` ), new uint, new double )

    perm( ( a, b ) => test( op( a, b ), double, `${op.name}(${a}, ${b}) -> double` ), new float, new double )

}
test.end()

test.start( "Vector-Vector Arithmetic" )
for ( const op of [add, sub, mul, div] ) {

    // Booleans
    for ( const type of [ivec2, ivec3, ivec4, uvec2, uvec3, uvec4, vec2, vec3, vec4, dvec2, dvec3, dvec4] ) {
        for ( const btype of [bvec2, bvec3, bvec4] ) {
            // Bool cant do arithmetic
            let a = new type, b = new btype
            test( op( a, b ), error, `${op.name}(${a}, ${b}) -> error` )
            test( op( b, a ), error, `${op.name}(${b}, ${a}) -> error` )
        }
    }

    // Same Types
    for ( const type of [ivec2, ivec3, ivec4, uvec2, uvec3, uvec4, vec2, vec3, vec4, dvec2, dvec3, dvec4] ) {
        let a = new type, b = new type
        test( op( a, b ), type, `${op.name}(${a}, ${b}) -> ${a}` )
    }

    // Promotions 
    perm( ( a, b ) => test( op( a, b ), uvec2, `${op.name}(${a}, ${b}) -> uvec2` ), new ivec2, new uvec2 )
    perm( ( a, b ) => test( op( a, b ), uvec3, `${op.name}(${a}, ${b}) -> uvec3` ), new ivec3, new uvec3 )
    perm( ( a, b ) => test( op( a, b ), uvec4, `${op.name}(${a}, ${b}) -> uvec4` ), new ivec4, new uvec4 )
    perm( ( a, b ) => test( op( a, b ), vec2, `${op.name}(${a}, ${b}) -> vec2` ), new ivec2, new vec2 )
    perm( ( a, b ) => test( op( a, b ), vec3, `${op.name}(${a}, ${b}) -> vec3` ), new ivec3, new vec3 )
    perm( ( a, b ) => test( op( a, b ), vec4, `${op.name}(${a}, ${b}) -> vec4` ), new ivec4, new vec4 )
    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new ivec2, new dvec2 )
    perm( ( a, b ) => test( op( a, b ), dvec3, `${op.name}(${a}, ${b}) -> dvec3` ), new ivec3, new dvec3 )
    perm( ( a, b ) => test( op( a, b ), dvec4, `${op.name}(${a}, ${b}) -> dvec4` ), new ivec4, new dvec4 )

    perm( ( a, b ) => test( op( a, b ), vec2, `${op.name}(${a}, ${b}) -> vec2` ), new uvec2, new vec2 )
    perm( ( a, b ) => test( op( a, b ), vec3, `${op.name}(${a}, ${b}) -> vec3` ), new uvec3, new vec3 )
    perm( ( a, b ) => test( op( a, b ), vec4, `${op.name}(${a}, ${b}) -> vec4` ), new uvec4, new vec4 )
    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new uvec2, new dvec2 )
    perm( ( a, b ) => test( op( a, b ), dvec3, `${op.name}(${a}, ${b}) -> dvec3` ), new uvec3, new dvec3 )
    perm( ( a, b ) => test( op( a, b ), dvec4, `${op.name}(${a}, ${b}) -> dvec4` ), new uvec4, new dvec4 )

    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new vec2, new dvec2 )
    perm( ( a, b ) => test( op( a, b ), dvec3, `${op.name}(${a}, ${b}) -> dvec3` ), new vec3, new dvec3 )
    perm( ( a, b ) => test( op( a, b ), dvec4, `${op.name}(${a}, ${b}) -> dvec4` ), new vec4, new dvec4 )

}
test.end()

test.start( "Scalar-Vector Arithmetic" )
for ( const op of [add, sub, mul, div] ) {

    // Scalar with integer vectors
    for ( const scalar of [int, uint, float, double] ) {
        for ( const vector of [ivec2, ivec3, ivec4, uvec2, uvec3, uvec4] ) {
            let a = new scalar, b = new vector
            test( op( a, b ), vector, `${op.name}(${a}, ${b}) -> ${b}` )
            test( op( b, a ), vector, `${op.name}(${b}, ${a}) -> ${b}` )
        }
    }

    // Scalar with float and double vectors
    for ( const scalar of [float, double] ) {
        for ( const vector of [vec2, vec3, vec4, dvec2, dvec3, dvec4] ) {
            let a = new scalar, b = new vector
            test( op( a, b ), vector, `${op.name}(${a}, ${b}) -> ${b}` )
            test( op( b, a ), vector, `${op.name}(${b}, ${a}) -> ${b}` )
        }
    }

    // Scalar promotions with integer vectors
    perm( ( a, b ) => test( op( a, b ), uvec2, `${op.name}(${a}, ${b}) -> uvec2` ), new int, new uvec2 )
    perm( ( a, b ) => test( op( a, b ), vec2, `${op.name}(${a}, ${b}) -> vec2` ), new int, new vec2 )
    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new int, new dvec2 )

    perm( ( a, b ) => test( op( a, b ), vec2, `${op.name}(${a}, ${b}) -> vec2` ), new uint, new vec2 )
    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new uint, new dvec2 )

    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new float, new dvec2 )

    // Scalar promotions with float and double vectors
    perm( ( a, b ) => test( op( a, b ), vec2, `${op.name}(${a}, ${b}) -> vec2` ), new float, new vec2 )
    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new float, new dvec2 )
    perm( ( a, b ) => test( op( a, b ), dvec2, `${op.name}(${a}, ${b}) -> dvec2` ), new double, new vec2 )
}
test.end()
