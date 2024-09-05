class Type {
    /** @param {string} name  */
    constructor( name ) { this.name = name }
    /** @returns {string} */
    defaultExpression() { return "" }
    /** @param {Type} type @returns {undefined|[]|[string,string]} */
    convertFrom( type ) { return }
}

class ScalarType extends Type {
    constructor( name, expression ) {
        super( name )
        this.expression = expression
        this.conversions = new Map
    }
    addConversion( type, func ) {
        this.conversions.set( type, func )
    }

    defaultExpression() {
        return this.expression
    }
    convertFrom( type ) {
        return this.conversions.get( type )
    }
}

export const Bool = new ScalarType( "bool", "false" )
export const Int = new ScalarType( "int", "0" )
export const Uint = new ScalarType( "uint", "0u" )
export const Float = new ScalarType( "float", "0." )

Bool.addConversion( Bool, [] )
Bool.addConversion( Int, ["bool(", ")"] )
Bool.addConversion( Uint, ["bool(", ")"] )
Bool.addConversion( Float, ["bool(", ")"] )

Int.addConversion( Bool, [] )
Int.addConversion( Int, [] )
Int.addConversion( Uint, ["int(", ")"] )
Int.addConversion( Float, ["int(", ")"] )

Uint.addConversion( Bool, [] )
Uint.addConversion( Int, [] )
Uint.addConversion( Uint, [] )
Uint.addConversion( Float, ["uint(", ")"] )

Float.addConversion( Bool, [] )
Float.addConversion( Int, [] )
Float.addConversion( Uint, [] )
Float.addConversion( Float, [] )

class VectorType extends Type {
    constructor( name, type, dimension ) {
        super( name )
        this.type = type
        this.dimension = dimension
    }

    defaultExpression() {
        return `${this.name}(0)`
    }
    convertFrom( type ) {
        if ( type instanceof VectorType ) {
            // vec4(vec2) => vec4(vec2, 0, 0)
            if ( this.dimension > type.dimension ) {
                return [
                    `${this.name}(`,
                    `${", 0".repeat( this.dimension - type.dimension )})`
                ]
            }
            // vec2(vec4) 
            if ( this.dimension < type.dimension ) {
                return [`${this.name}(`, ")"]
            }
            // vec3(vec3)
            if ( this.type.convertFrom( type.type ).length !== 0 ) {
                return [`${this.name}(`, ")"]
            }
            return []
        }
        if ( type instanceof ScalarType ) {
            return [`${this.name}(`, ")"]
        }
    }
}

export const Bvec2 = new VectorType( "bvec2", Bool, 2 )
export const Bvec3 = new VectorType( "bvec3", Bool, 3 )
export const Bvec4 = new VectorType( "bvec4", Bool, 4 )
export const Ivec2 = new VectorType( "ivec2", Int, 2 )
export const Ivec3 = new VectorType( "ivec3", Int, 3 )
export const Ivec4 = new VectorType( "ivec4", Int, 4 )
export const Uvec2 = new VectorType( "uvec2", Uint, 2 )
export const Uvec3 = new VectorType( "uvec3", Uint, 3 )
export const Uvec4 = new VectorType( "uvec4", Uint, 4 )
export const Vec2 = new VectorType( "vec2", Float, 2 )
export const Vec3 = new VectorType( "vec3", Float, 3 )
export const Vec4 = new VectorType( "vec4", Float, 4 )

console.log( [
    Bool.convertFrom( Bool ),
    Bool.convertFrom( Int ),
    Bvec2.convertFrom( Bvec2 ),
    Bvec2.convertFrom( Ivec2 ),
] )