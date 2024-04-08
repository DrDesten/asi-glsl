function recursiveUnwrap( object ) {
    function unwrap( object, array ) {
        switch ( typeof object ) {
            case "undefined":
            case "function":
                return
            case "object":
                if ( object !== null )
                    Object.values( object ).map( value => unwrap( value, array ) )
                return
            default:
                array.push( object )
                return
        }
    }
    const array = []
    unwrap( object, array )
    return array
}

// Transparent Types 
///////////////////////

const VoidType = "void"
const BoolType = "bool"

const ScalarTypes = ["int", "uint", "float", "double"]
const VectorTypes = ["vec2", "vec3", "vec4"]
    .flatMap( t => ["", "d", "b", "i", "u"].map( prefix => prefix + t ) )
const MatrixTypes = ["mat2", "mat3", "mat4"]
    .flatMap( t => ["", "d"].map( p => p + t ) )
    .flatMap( t => ["", "x2", "x3", "x4"].map( suffix => t + suffix ) )

const NumericTypes = {
    Scalar: ScalarTypes,
    Vector: VectorTypes,
    Matrix: MatrixTypes,
    all() { return recursiveUnwrap( this ) }
}

const ValueTypes = {
    Bool: [BoolType],
    Scalar: ScalarTypes,
    Vector: VectorTypes,
    Matrix: MatrixTypes,
    all() { return recursiveUnwrap( this ) }
}

const TransparentTypes = {
    Void: [VoidType],
    Bool: [BoolType],
    Scalar: ScalarTypes,
    Vector: VectorTypes,
    Matrix: MatrixTypes,
    all() { return recursiveUnwrap( this ) }
}

// Opaque Types
//////////////////

// Floating-Point Opaque Types

const FloatSamplerTypes = [
    "sampler1D",
    "sampler1DShadow",
    "sampler1DArray",
    "sampler1DArrayShadow",
    "sampler2D",
    "sampler2DShadow",
    "sampler2DArray",
    "sampler2DArrayShadow",
    "sampler2DMS",
    "sampler2DMSArray",
    "sampler2DRect",
    "sampler2DRectShadow",
    "sampler3D",
    "samplerCube",
    "samplerCubeShadow",
    "samplerCubeArray",
    "samplerCubeArrayShadow",
    "samplerBuffer",
]

const FloatTextureTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => t.replace( "sampler", "texture" ) )

const FloatImageTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => t.replace( "sampler", "image" ) )

const FloatSubpassTypes = ["subpassInput", "subpassInputMS"]

const FloatOpaqueTypes = {
    FloatSamplerTypes,
    FloatTextureTypes,
    FloatImageTypes,
    FloatSubpassTypes,
    all() { return recursiveUnwrap( this ) }
}

// Signed Integer Opaque Types

const IntSamplerTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => "i" + t )

const IntTextureTypes = FloatTextureTypes
    .map( t => "i" + t )

const IntImageTypes = FloatImageTypes
    .map( t => "i" + t )

const IntSubpassTypes = FloatSubpassTypes
    .map( t => "i" + t )

const IntOpaqueTypes = {
    IntSamplerTypes,
    IntTextureTypes,
    IntImageTypes,
    IntSubpassTypes,
    all() { return recursiveUnwrap( this ) }
}

// Unsigned Integer Opaque Types

const UintSamplerTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => "u" + t )

const UintTextureTypes = FloatTextureTypes
    .map( t => "u" + t )

const UintImageTypes = FloatImageTypes
    .map( t => "u" + t )

const UintSubpassTypes = FloatSubpassTypes
    .map( t => "u" + t )

const UintAtomicTypes = ["atomic_uint"]

const UintOpaqueTypes = {
    UintSamplerTypes,
    UintTextureTypes,
    UintImageTypes,
    UintSubpassTypes,
    UintAtomicTypes,
    all() { return recursiveUnwrap( this ) }
}

// Sampler Opaque Types

const SamplerTypes = ["sampler", "samplerShadow"]

const SamplerOpaqueTypes = {
    SamplerTypes,
    all() { return recursiveUnwrap( this ) }
}


// All Built-in Types
////////////////////////

const BuiltinTypes = {
    TransparentTypes,
    FloatOpaqueTypes,
    IntOpaqueTypes,
    UintOpaqueTypes,
    SamplerOpaqueTypes,
    all() { return recursiveUnwrap( this ) }
}

module.exports = {
    VoidType,
    BoolType,
    ScalarTypes,
    VectorTypes,
    MatrixTypes,
    NumericTypes,
    ValueTypes,
    TransparentTypes,
    FloatSamplerTypes,
    FloatTextureTypes,
    FloatImageTypes,
    FloatSubpassTypes,
    FloatOpaqueTypes,
    IntSamplerTypes,
    IntTextureTypes,
    IntImageTypes,
    IntSubpassTypes,
    IntOpaqueTypes,
    UintSamplerTypes,
    UintTextureTypes,
    UintImageTypes,
    UintSubpassTypes,
    UintAtomicTypes,
    UintOpaqueTypes,
    SamplerTypes,
    SamplerOpaqueTypes,
    BuiltinTypes,
}