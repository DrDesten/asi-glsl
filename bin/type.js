class Type {
    toString() { return "unknown" }
    get typeClass() { return "unknown" }
}
class Scalar extends Type {
    toString() { return "unknown" }
    get typeClass() { return "scalar" }
}
/** @param {Scalar} underlyingType @param {number} dimensionality */
function Vector( underlyingType, dimensionality ) {
    return class Vector extends Type {
        toString() { return "unknown" }
        get typeClass() { return "vector" }
        get underlyingType() { return underlyingType }
        get dimensionality() { return dimensionality }
    }
}

class error extends Type { toString() { return "error" } }
class void_ extends Type { toString() { return "void" } }

class bool extends Scalar { toString() { return "bool" } }
class int extends Scalar { toString() { return "int" } }
class uint extends Scalar { toString() { return "uint" } }
class float extends Scalar { toString() { return "float" } }
class double extends Scalar { toString() { return "double" } }

class bvec2 extends Vector( bool, 2 ) { toString() { return "bvec2" } }
class bvec3 extends Vector( bool, 3 ) { toString() { return "bvec3" } }
class bvec4 extends Vector( bool, 4 ) { toString() { return "bvec4" } }
class ivec2 extends Vector( int, 2 ) { toString() { return "ivec2" } }
class ivec3 extends Vector( int, 3 ) { toString() { return "ivec3" } }
class ivec4 extends Vector( int, 4 ) { toString() { return "ivec4" } }
class uvec2 extends Vector( uint, 2 ) { toString() { return "uvec2" } }
class uvec3 extends Vector( uint, 3 ) { toString() { return "uvec3" } }
class uvec4 extends Vector( uint, 4 ) { toString() { return "uvec4" } }
class vec2 extends Vector( float, 2 ) { toString() { return "vec2" } }
class vec3 extends Vector( float, 3 ) { toString() { return "vec3" } }
class vec4 extends Vector( float, 4 ) { toString() { return "vec4" } }
class dvec2 extends Vector( double, 2 ) { toString() { return "dvec2" } }
class dvec3 extends Vector( double, 3 ) { toString() { return "dvec3" } }
class dvec4 extends Vector( double, 4 ) { toString() { return "dvec4" } }

function getVector( underlyingType, dimensionality ) {
    switch ( underlyingType ) {
        case bool: return [bvec2, bvec3, bvec4][dimensionality - 2]
        case int: return [ivec2, ivec3, ivec4][dimensionality - 2]
        case uint: return [uvec2, uvec3, uvec4][dimensionality - 2]
        case float: return [vec2, vec3, vec4][dimensionality - 2]
        case double: return [dvec2, dvec3, dvec4][dimensionality - 2]
    }
}


function scalarPromotion( a, b ) {
    console.assert( a.typeClass === "scalar", "Unable to Scalar-Promote non-scalar", a )
    console.assert( b.typeClass === "scalar", "Unable to Scalar-Promote non-scalar", b )

    if ( a instanceof bool || b instanceof bool ) return new error

    const Ruleset = new Map( [
        [int, 1],
        [uint, 2],
        [float, 3],
        [double, 4],
    ] )
    const ap = Ruleset.get( a.constructor )
    const bp = Ruleset.get( b.constructor )

    if ( ap === bp ) {
        return new a.constructor
    }
    if ( ap > bp ) {
        return new a.constructor
    }
    if ( ap < bp ) {
        return new b.constructor
    }
}
function vectorPromotion( a, b ) {
    console.assert( a.typeClass === "vector", "Unable to Vector-Promote non-vector", a )
    console.assert( b.typeClass === "vector", "Unable to Vector-Promote non-vector", b )

    if ( a.dimensionality !== b.dimensionality ) return new error
    if (
        a instanceof bvec2 || b instanceof bvec2 ||
        a instanceof bvec3 || b instanceof bvec3 ||
        a instanceof bvec4 || b instanceof bvec4
    ) return new error

    const Ruleset = new Map( [
        [int, 1],
        [uint, 2],
        [float, 3],
        [double, 4],
    ] )
    const ap = Ruleset.get( a.underlyingType )
    const bp = Ruleset.get( b.underlyingType )

    if ( ap === bp ) {
        return new a.constructor
    }
    if ( ap > bp ) {
        return new a.constructor
    }
    if ( ap < bp ) {
        return new b.constructor
    }
}

function mixedPromotion( a, b ) {
    console.assert( a.typeClass !== b.typeClass, "Cannot Mix-Promote types of the same class", a, b )

    const au = a.typeClass === "scalar" ? a.constructor : a.underlyingType
    const bu = b.typeClass === "scalar" ? b.constructor : b.underlyingType
    const dim = Math.max( a.dimensionality || 0, b.dimensionality || 0 )

    console.assert( dim > 0, "Cannot Mix-Promote non-vector and non-scalar", a, b )

    if ( au === bool || bu === bool ) return new error

    const Ruleset = new Map( [
        [int, 1],
        [uint, 2],
        [float, 3],
        [double, 4],
    ] )
    const ap = Ruleset.get( au )
    const bp = Ruleset.get( bu )

    if ( ap === bp ) {
        return new ( getVector( au, dim ) )
    }
    if ( ap > bp ) {
        return new ( getVector( au, dim ) )
    }
    if ( ap < bp ) {
        return new ( getVector( bu, dim ) )
    }
}

function add( a, b ) {
    if ( a.typeClass === "unknown" || b.typeClass === "unknown" ) return new error
    if ( a.typeClass === "scalar" && b.typeClass === "scalar" ) return scalarPromotion( a, b )
    if ( a.typeClass === "vector" && b.typeClass === "vector" ) return vectorPromotion( a, b )
    return mixedPromotion( a, b )
}
function sub( a, b ) {
    if ( a.typeClass === "unknown" || b.typeClass === "unknown" ) return new error
    if ( a.typeClass === "scalar" && b.typeClass === "scalar" ) return scalarPromotion( a, b )
    if ( a.typeClass === "vector" && b.typeClass === "vector" ) return vectorPromotion( a, b )
    return mixedPromotion( a, b )
}
function mul( a, b ) {
    if ( a.typeClass === "unknown" || b.typeClass === "unknown" ) return new error
    if ( a.typeClass === "scalar" && b.typeClass === "scalar" ) return scalarPromotion( a, b )
    if ( a.typeClass === "vector" && b.typeClass === "vector" ) return vectorPromotion( a, b )
    return mixedPromotion( a, b )
}
function div( a, b ) {
    if ( a.typeClass === "unknown" || b.typeClass === "unknown" ) return new error
    if ( a.typeClass === "scalar" && b.typeClass === "scalar" ) return scalarPromotion( a, b )
    if ( a.typeClass === "vector" && b.typeClass === "vector" ) return vectorPromotion( a, b )
    return mixedPromotion( a, b )
}

module.exports = {
    Type,

    error,
    void_,

    bool,
    int,
    uint,
    float,
    double,

    bvec2,
    bvec3,
    bvec4,
    ivec2,
    ivec3,
    ivec4,
    uvec2,
    uvec3,
    uvec4,
    vec2,
    vec3,
    vec4,
    dvec2,
    dvec3,
    dvec4,

    add,
    sub,
    mul,
    div,
}