varying vec2 vUv;
uniform vec2 resolution;
uniform sampler2D tex;

#include <packing>

#pragma glslify: blur13 = require( './gaussBlur13.glsl' )

void main(){

	vec2 d;

	#ifdef VERTICAL

		d = vec2( 0.0, 1.0 );

	#else

		d = vec2( 1.0, 0.0 );

	#endif

	gl_FragColor = blur13( tex, vUv, resolution, d );

}