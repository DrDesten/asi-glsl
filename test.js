import { GLSLLexer } from "./bin/lexer.js"
import { Parse } from "./bin/parser.js"
import { visualize } from "./lib/lexervis.js"
import util from "util"

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

    /* vec3 colors[9] = vec3[]( vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0),vec3(0) );

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
    } */

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


var text = `
uniform vec2 screenSize
uniform vec2 screenSizeInverse

int a = 10, 2
`

const tokens = GLSLLexer.lex( text )
console.log( tokens )

const semicolons = Parse( tokens )
console.log( semicolons )