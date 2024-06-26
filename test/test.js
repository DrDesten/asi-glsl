const { GLSLLexer } = require( "../bin/lexer.js" )
const { Parse } = require( "../bin/parser.js" )
const { visualize } = require( "../lib/lexervis.js" )
const util = require( "util" )

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

//console.log( "===\n", string )
//console.log( "===\n", string.replace( /#.+/g, "" ) )
//console.log( "===\n", string.replace( /#(\\\n|.)+/g, "" ) )
//console.log( "===\n", string.replace( /#.+|(?<=\\\n).+/g, "" ) )

var text = `
#include "/lib/settings.glsl"
#include "/core/math.glsl"
#include "/core/core/color.glsl"

uniform vec2 screenSize;
uniform vec2 screenSizeInverse;

uniform sampler2D colortex6;

in vec2 coord;

vec4 spin(vec2 offs) {
    vec2 spin = vec2(0);
    spin.x = sin(offs.x);
    spin.y = cos(offs.y);
    return vec4(spin, 0, 0);
}

/* DRAWBUFFERS:6 */
layout(location = 0) out vec4 FragOut0;
void main() {
    ivec2 pixel = ivec2(coord * screenSize);

    vec3 colors[9] = vec3[]( vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0) );

    if (pixel.x < int(screenSize.x) / 3 && pixel.y < int(screenSize.y) / 3) {
        colors = vec3[](
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(-1, 1), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(0, 1), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(1, 1), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(-1, 0), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(0, 0), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(1, 0), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(-1, -1), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(0, -1), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(1, -1), 0).rgb)
        );
    }

    float hits = 0;
    vec3 color = vec3(0);
    for (int i = 0; i < 9; i++) {
        if (colors[i] != vec3(0)) {
            hits  += 1;
            color += colors[i];
        }
    }

    if (hits > 0) {
        color = oklab2rgb(color / hits);
    }

    vec3 colors[4] = vec3[]( vec3(0),vec3(0),vec3(0),vec3(0) );

    if (pixel.x < int(screenSize.x) / 2 && pixel.y < int(screenSize.y) / 2) {
        colors = vec3[](
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(0, 0), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(1, 0), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(0, 1), 0).rgb),
            rgb2oklab(texelFetch(colortex6, pixel + ivec2(1, 1), 0).rgb)
        );
    }

    float hits = 0;
    vec3 color = vec3(0);
    for (int i = 0; i < 4; i++) {
        if (colors[i] != vec3(0)) {
            hits  += 1;
            color += colors[i];
        }
    }

    if (hits > 0) {
        color = oklab2rgb(color / hits);
    }

    FragOut0 = vec4(color, 1);
}
`



text = `
#define VEC2_ROT(angle, length) \\
    vec2(cos(angle), sin(angle))
uniform vec2 screenSize, screenSizeInverse
int x = 0, y = 0, z = 0
vec4 saturate(vec4 x) { return clamp(x, 0.0, 1.0) }
layout(location = 0) out vec4 FragOut0
2 && 2
`

text = `
in Light {
    vec4 LightPos;
    vec3 LightColor;
};
in ColoredTexture {
    vec4 Color;
    vec2 TexCoord;
} Material;           // instance name
vec3 Color;           // different Color than Material.Color
vec4 LightPos;
`

text = `
int x = true
`

const originalSemicolons = [...text.matchAll( /;/g )].map( m => m.index )

const tokens = GLSLLexer().lex( text || text.replace( /;/g, "" ) )
console.log( tokens.map( t => [t.type, t.text, ...Object.values( t.props )] ) )

const { ast, edits, counts } = Parse( tokens )

console.log( edits, counts )