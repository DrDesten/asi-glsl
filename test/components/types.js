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

export const VoidType = "void"
export const BoolType = "bool"

export const ScalarTypes = ["int", "uint", "float", "double"]
export const VectorTypes = ["vec2", "vec3", "vec4"]
    .flatMap( t => ["", "d", "b", "i", "u"].map( prefix => prefix + t ) )
export const MatrixTypes = ["mat2", "mat3", "mat4"]
    .flatMap( t => ["", "d"].map( p => p + t ) )
    .flatMap( t => ["", "x2", "x3", "x4"].map( suffix => t + suffix ) )

export const TransparentTypes = {
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

export const FloatSamplerTypes = [
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

export const FloatTextureTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => t.replace( "sampler", "texture" ) )

export const FloatImageTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => t.replace( "sampler", "image" ) )

export const FloatSubpassTypes = ["subpassInput", "subpassInputMS"]

export const FloatOpaqueTypes = {
    FloatSamplerTypes,
    FloatTextureTypes,
    FloatImageTypes,
    FloatSubpassTypes,
    all() { return recursiveUnwrap( this ) }
}

// Signed Integer Opaque Types

export const IntSamplerTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => "i" + t )

export const IntTextureTypes = FloatTextureTypes
    .map( t => "i" + t )

export const IntImageTypes = FloatImageTypes
    .map( t => "i" + t )

export const IntSubpassTypes = FloatSubpassTypes
    .map( t => "i" + t )

export const IntOpaqueTypes = {
    IntSamplerTypes,
    IntTextureTypes,
    IntImageTypes,
    IntSubpassTypes,
    all() { return recursiveUnwrap( this ) }
}

// Unsigned Integer Opaque Types

export const UintSamplerTypes = FloatSamplerTypes
    .filter( t => !t.includes( "Shadow" ) )
    .map( t => "u" + t )

export const UintTextureTypes = FloatTextureTypes
    .map( t => "u" + t )

export const UintImageTypes = FloatImageTypes
    .map( t => "u" + t )

export const UintSubpassTypes = FloatSubpassTypes
    .map( t => "u" + t )

export const UintAtomicTypes = ["atomic_uint"]

export const UintOpaqueTypes = {
    UintSamplerTypes,
    UintTextureTypes,
    UintImageTypes,
    UintSubpassTypes,
    UintAtomicTypes,
    all() { return recursiveUnwrap( this ) }
}

// Sampler Opaque Types

export const SamplerTypes = ["sampler", "samplerShadow"]

export const SamplerOpaqueTypes = {
    SamplerTypes,
    all() { return recursiveUnwrap( this ) }
}


// All Built-in Types
////////////////////////

export const BuiltinTypes = {
    TransparentTypes,
    FloatOpaqueTypes,
    IntOpaqueTypes,
    UintOpaqueTypes,
    SamplerOpaqueTypes,
    all() { return recursiveUnwrap( this ) }
}

export default BuiltinTypes