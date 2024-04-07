const rand = {
    b() {
        return Math.random() < 0.5
    },

    /** @param {number} min @param {number} max */
    i( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min
    },
    i32() {
        return this.i( -2147483648, 2147483647 )
    },
    u32() {
        return this.i( 0, 4294967295 )
    },

    d() {
        const int = BigInt( this.u32() ) << 32n | BigInt( this.u32() )
        const buffer = new ArrayBuffer( 8 )
        new DataView( buffer ).setBigInt64( 0, int )
        const double = new DataView( buffer ).getFloat64( 0 )
        return isFinite( double ) ? double : 0
    },
    f() {
        const buffer = new ArrayBuffer( 4 )
        new DataView( buffer ).setUint32( 0, this.u32() )
        const float = new DataView( buffer ).getFloat32( 0 )
        return isFinite( float ) ? float : 0
    },
}

/** @param {boolean} value */
export function BooleanLiteral( value ) {
    value = value ?? rand.b()
    return value ? "true" : "false"
}

/** @param {number} value @param {"decimal"|"octal"|"hexadecimal"} type  */
export function IntLiteral( value, type ) {
    value = value ?? rand.i32()
    type = type ?? ["decimal", "octal", "hexadecimal"][rand.i( 0, 2 )]
    const prefix = { decimal: "", octal: "0", hexadecimal: "0x" }[type]
    const base = { decimal: 10, octal: 8, hexadecimal: 16 }[type]
    return prefix + value.toString( base )
}

/** @param {number} value @param {"decimal"|"octal"|"hexadecimal"} type @param {"u"|"U"} suffix */
export function UintLiteral( value, type, suffix ) {
    value = value ?? rand.u32()
    type = type ?? ["decimal", "octal", "hexadecimal"][rand.i( 0, 2 )]
    suffix = suffix ?? ["u", "U"][rand.i( 0, 1 )]
    const prefix = { decimal: "", octal: "0", hexadecimal: rand.b() ? "0x" : "0X" }[type]
    const base = { decimal: 10, octal: 8, hexadecimal: 16 }[type]
    const number = value.toString( base ).split( "" ).map( c => c[rand.b() ? "toUpperCase" : "toLowerCase"]() ).join( "" )
    return prefix + number + suffix
}

/** @param {number} value @param {""|"f"|"F"} suffix */
export function FloatLiteral( value, suffix ) {
    value = value ?? rand.f()
    suffix = suffix ?? ["", "f", "F"][rand.i( 0, 2 )]
    const number = value.toString()[rand.b() ? "toUpperCase" : "toLowerCase"]().replace( /^(-?)0(?=\.)/, "$1" )
    return number + suffix
}

/** @param {number} value @param {"lf"|"LF"} suffix */
export function DoubleLiteral( value, suffix ) {
    value = value ?? rand.d()
    suffix = suffix ?? ["lf", "LF"][rand.i( 0, 1 )]
    const number = value.toString()[rand.b() ? "toUpperCase" : "toLowerCase"]().replace( /^(-?)0(?=\.)/, "$1" )
    return number + suffix
}