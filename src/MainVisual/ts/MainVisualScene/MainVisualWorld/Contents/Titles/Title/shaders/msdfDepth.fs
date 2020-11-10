#if DEPTH_PACKING == 3200

	uniform float opacity;

#endif

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform sampler2D tex;
varying vec2 vUv;
varying vec2 vHighPrecisionZW;
uniform float left;
uniform float top;
uniform float width;
uniform float height;

float median( float r, float g, float b ) {
	
    return max( min( r, g ), min( max( r, g ), b ) );
	
}

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( 1.0 );

	#if DEPTH_PACKING == 3200

		diffuseColor.a = opacity;

	#endif

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>

	#include <logdepthbuf_fragment>

	// Higher precision equivalent of gl_FragCoord.z. This assumes depthRange has been left to its default values.
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;

	#if DEPTH_PACKING == 3200

		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );

	#elif DEPTH_PACKING == 3201

		gl_FragColor = packDepthToRGBA( fragCoordZ * 0.0 );

	#endif

	vec4 col = texture2D( tex, vUv );
    float sigDist = median(col.r, col.g, col.b) - 0.5;
	
    float alpha = step(0.0, sigDist);
	alpha *= step( vUv.y, 1.0 - top );
	alpha *= step( 1.0 - top - height, vUv.y );
	alpha *= step( left, vUv.x  );
	alpha *= step( vUv.x, left + width );
	
    if (alpha < 0.001) discard;

}