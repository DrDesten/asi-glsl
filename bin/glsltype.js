class T {
    static Error = new T( null, [] )

    static Void = new T( null, [] )
    static Bool = new T( null, [1] )
    static Int = new T( null, [1] )
    static Uint = new T( null, [1] )
    static Float = new T( null, [1] )
    static Double = new T( null, [1] )

    static Bvec2 = new T( T.Bool, [2] )
    static Bvec3 = new T( T.Bool, [3] )
    static Bvec4 = new T( T.Bool, [4] )
    static Ivec2 = new T( T.Int, [2] )
    static Ivec3 = new T( T.Int, [3] )
    static Ivec4 = new T( T.Int, [4] )
    static Uvec2 = new T( T.Uint, [2] )
    static Uvec3 = new T( T.Uint, [3] )
    static Uvec4 = new T( T.Uint, [4] )
    static Vec2 = new T( T.Float, [2] )
    static Vec3 = new T( T.Float, [3] )
    static Vec4 = new T( T.Float, [4] )
    static Dvec2 = new T( T.Double, [2] )
    static Dvec3 = new T( T.Double, [3] )
    static Dvec4 = new T( T.Double, [4] )

    static Scalars = [T.Bool, T.Int, T.Uint, T.Float, T.Double]
    static Vectors = [T.Bvec2, T.Bvec3, T.Bvec4, T.Ivec2, T.Ivec3, T.Ivec4, T.Uvec2, T.Uvec3, T.Uvec4, T.Vec2, T.Vec3, T.Vec4, T.Dvec2, T.Dvec3, T.Dvec4]

    /** @param {string|T} type */
    static new( type ) {
        if ( type instanceof T ) {
            return type
        }
        switch ( type ) {
            case "void": return T.Void
            case "bool": return T.Bool
            case "int": return T.Int
            case "uint": return T.Uint
            case "float": return T.Float
            case "double": return T.Double
            case "bvec2": return T.Bvec2
            case "bvec3": return T.Bvec3
            case "bvec4": return T.Bvec4
            case "ivec2": return T.Ivec2
            case "ivec3": return T.Ivec3
            case "ivec4": return T.Ivec4
            case "uvec2": return T.Uvec2
            case "uvec3": return T.Uvec3
            case "uvec4": return T.Uvec4
            case "vec2": return T.Vec2
            case "vec3": return T.Vec3
            case "vec4": return T.Vec4
            case "dvec2": return T.Dvec2
            case "dvec3": return T.Dvec3
            case "dvec4": return T.Dvec4
        }
        return T.Error
    }

    /** @param {T} underlyingType @param {number[]} shape */
    static from( underlyingType, shape ) {
        if ( shape.length === 0 ) {
            return underlyingType === T.Void ? T.Void : T.Error
        }
        if ( shape.length === 1 ) {
            if ( shape[0] === 1 ) {
                return underlyingType === T.Bool || underlyingType.isNumeric()
                    ? underlyingType : T.Error
            }
            switch ( underlyingType ) {
                case T.Bool: return [, , T.Bvec2, T.Bvec3, T.Bvec4][shape[0]] ?? T.Error
                case T.Int: return [, , T.Ivec2, T.Ivec3, T.Ivec4][shape[0]] ?? T.Error
                case T.Uint: return [, , T.Uvec2, T.Uvec3, T.Uvec4][shape[0]] ?? T.Error
                case T.Float: return [, , T.Vec2, T.Vec3, T.Vec4][shape[0]] ?? T.Error
                case T.Double: return [, , T.Dvec2, T.Dvec3, T.Dvec4][shape[0]] ?? T.Error
                default: return T.Error
            }
        }
        return T.Error
    }

    /** @param {T} underlyingType @param {number[]} shape */
    constructor( underlyingType, shape ) {
        this.underlyingType = underlyingType ?? this
        this.shape = shape ?? []
    }

    /** @param {T} type1 @param {T} type2 */
    static implicitCommonType( type1, type2 ) {
        const [high, low] = type1.rank() > type2.rank() ? [type1, type2] : [type2, type1]
        return low.implicitConvertableTo( high ) ? high : T.Error
    }

    /** @returns {string} */
    identifier() {
        if ( this === T.Void ) return "void"
        if ( this === T.Bool ) return "bool"
        if ( this === T.Int ) return "int"
        if ( this === T.Uint ) return "uint"
        if ( this === T.Float ) return "float"
        if ( this === T.Double ) return "double"

        if ( !this.underlyingType.isScalar() )
            return

        if ( this.shape.length === 1 && this.shape[0] >= 2 && this.shape <= 4 ) {
            const prefix = { bool: "b", int: "i", uint: "u", float: "", double: "d" }[this.underlyingType.identifier()]
            return `${prefix}vec${this.shape[0]}`
        }
    }

    isInteger() {
        return this === T.Int || this === T.Uint
    }
    isFloatingPoint() {
        return this === T.Float || this === T.Double
    }
    isNumeric() {
        return this.isInteger() || this.isFloatingPoint()
    }
    isScalar() {
        return this.isNumeric() || this === T.Bool
    }

    rank() {
        return {
            void: 0,
            bool: 1,
            int: 2,
            uint: 3,
            float: 4,
            double: 5,
        }[this.underlyingType.identifier()] ?? -1
    }

    /** @returns {T[]} */
    implicitConversions() {
        if ( this.underlyingType !== this ) {
            const underlyingConversions = this.underlyingType.implicitConversions()
            return underlyingConversions.map( t => T.from( t, this.shape ) )
        }
        if ( this === T.Void || this === T.Bool ) {
            return [this]
        }
        switch ( this ) {
            case T.Int: return [T.Int, T.Uint, T.Float, T.Double]
            case T.Uint: return [T.Uint, T.Float, T.Double]
            case T.Float: return [T.Float, T.Double]
            case T.Double: return [T.Double]
        }
        return []
    }

    /** @param {T} type */
    implicitConvertableTo( type ) {
        return this.implicitConversions().includes( type )
    }

    /** @returns {T[]} */
    explicitConversions() {
        if ( this === T.Void ) {
            return [this]
        }
        switch ( this ) {
            case T.Bool: return [...T.Scalars, ...T.Vectors]
            case T.Int: return [...T.Scalars, ...T.Vectors]
            case T.Uint: return [...T.Scalars, ...T.Vectors]
            case T.Float: return [...T.Scalars, ...T.Vectors]
            case T.Double: return [...T.Scalars, ...T.Vectors]
        }
        return []
    }

    /** @param {T} type */
    explicitConvertableTo( type ) {
        return this.explicitConversions().includes( type )
    }

}

module.exports = {
    T,
}