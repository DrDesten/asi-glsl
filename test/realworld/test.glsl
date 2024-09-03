#include "xyz.glsl"
#include "/lib/xyz.glsl"

uniform sampler2D colortex1;
uniform sampler2D colortex4; 
const bool colortex4MipmapEnabled = true;
uniform sampler2D colortex5;

uniform int   isEyeInWater;
uniform float far;
uniform ivec2 eyeBrightnessSmooth;
uniform vec3  sunDir;
uniform vec3  up;
uniform vec3  upPosition;
uniform float sunset;
uniform float daynight;
uniform float rainStrength;
uniform float normalizedTime;
uniform float customStarBlend;
uniform float frameTimeCounter;
uniform float customLightmapBlend;

flat in vec4 handLight;

vec2 coord = gl_FragCoord.xy * screenSizeInverse;

vec2 cubemapCoords(vec3 direction) {
    float l  = max(max(abs(direction.x), abs(direction.y)), abs(direction.z));
    vec3 dir = direction / l;
    vec3 absDir = abs(dir);
    
    vec2 coord;
    if (absDir.x >= absDir.y && absDir.x > absDir.z) {
        if (dir.x > 0) {
            coord = vec2(0, 0.5) + (dir.zy * vec2(1, -1) + 1);
        } else {
            coord = vec2(2.0 / 3, 0.5) + (-dir.zy + 1);
        }
    } else if (absDir.y >= absDir.z) {
        if (dir.y > 0) {
            coord = vec2(1.0 / 3, 0) + (dir.xz * vec2(-1, 1) + 1);
        } else {
            coord = vec2(0, 0) + (-dir.xz + 1);
        }
    } else {
        if (dir.z > 0) {
            coord = vec2(1.0 / 3, 0.5) + (-dir.xy + 1);
        } else {
            coord = vec2(2.0 / 3, 0) + (dir.xy * vec2(1, -1) + 1);
        }
    }
    return coord;
}


float starVoronoi(vec2 coord, float maxDeviation) {
    vec2 guv = fract(coord) - 0.5;
    vec2 gid = floor(coord);
	vec2 p   = (rand2(gid) - 0.5) * maxDeviation; // Get Point in grid cell
	float d  = sqmag(p-guv);                    // Get distance to that point
    return d;
}
float shootingStar(vec2 coord, vec2 dir, float thickness, float slope) {
	dir    *= 0.9;
	vec2 pa = coord + (dir * 0.5);
    float t = saturate(dot(pa, dir) * ( 1. / dot(dir,dir) ) );
    float d = sqmag(dir * -t + pa);
    return saturate((thickness - d) * slope + 1) * t;
}

/* DRAWBUFFERS:0 */
layout(location = 0) out vec4 FragOut0;
void main() {
	float depth     = getDepth(coord);
	vec3  screenPos = vec3(coord, depth);
	vec3  viewPos   = toView(screenPos * 2 - 1);
	vec3  viewDir   = normalize(viewPos);
	vec3  playerPos = toPlayer(viewPos);
	vec3  playerDir = normalize(playerPos);

#ifdef DISTANT_HORIZONS
	float dhDepth     = getDepthDH(coord);
	vec3  dhScreenPos = vec3(coord, dhDepth);
	vec3  dhViewPos   = screenToViewDH(dhScreenPos);
	vec3  dhPlayerPos = toPlayer(dhViewPos);

	vec3  combinedViewPos   = depth < 1 ? viewPos : dhViewPos;
	vec3  combinedPlayerPos = depth < 1 ? playerPos : dhPlayerPos;
#else
	vec3  combinedViewPos   = viewPos;
	vec3  combinedPlayerPos = playerPos;
#endif

	vec4 skyGradient = getSkyColor_fogArea(viewDir, sunDir);
	vec3 color       = getAlbedo(coord);

#ifndef DISTANT_HORIZONS
	bool isSky = depth >= 1;
#else
	bool isSky = depth >= 1 && dhDepth >= 1;
#endif
	if (isSky) { 

		color += skyGradient.rgb;

		#ifdef CAVE_SKY
		float cave = max( saturate(eyeBrightnessSmooth.y * (4./240.) - 0.25), saturate(cameraPosition.y * 0.25 - (CAVE_SKY_HEIGHT * 0.25)) );
		color = mix(fogCaveColor, color, cave);
		#endif

	} else {

		vec4 lmcoord = getLightmap(coord);
		color       *= getCustomLightmap(lmcoord.xyz, customLightmapBlend) * (1 - lmcoord.a) + lmcoord.a;

        float fog  = fogFactorTerrain(combinedPlayerPos);
        float cave = max( saturate(eyeBrightnessSmooth.y * (4./240.) - 0.25), saturate(lmcoord.y * 1.5 - 0.25) );
        color      = mix(color, mix(fogCaveColor, skyGradient.rgb, cave), fog);
	}

	color   += ditherColor(gl_FragCoord.xy);
	FragOut0 = vec4(color, 1.0); //gcolor
}