varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D cocTex;

uniform float time;

#include <packing>

#pragma glslify: random = require('./random.glsl' )
#pragma glslify: import('./constants.glsl' )

#define SAMPLE_COUNT 128

vec2 poissonDisk[ SAMPLE_COUNT ];

void initPoissonDisk() {

	float r = 1.0 / float( SAMPLE_COUNT );
	float rStep = r;

	float ang = random( gl_FragCoord.xy * 0.01 + sin(time) ) * TPI;
	float angStep = rStep * TPI * 11.0;

	for( int i = 0; i < SAMPLE_COUNT; i++ ) {
		
		poissonDisk[ i ] = vec2(
			sin( ang ),
			cos( ang )
		) * pow( r, 0.75 );

		r += rStep;
		ang += angStep;
	}
	
}

float unpack16( vec2 value ) {
  return dot( value, vec2( 1.0, 1.0 / 255.0 ) );
}

void main(){

	initPoissonDisk();

	float coc = 0.0;
	vec4 baseTex = texture2D( cocTex, vUv );
	float ccc = unpack16( baseTex.xy );
	float baseDepth = unpack16( baseTex.zw );

	float cnt = 0.0;

	
	for( int i = 0; i < SAMPLE_COUNT; i ++  ) {

		vec2 offset = poissonDisk[ i ] * ccc * 0.05; 
		vec4 tex = texture2D( cocTex, vUv + offset );

		float depth = unpack16( tex.zw );
		float scoc = unpack16( tex.xy );

		// if( depth <= baseDepth ) {

			coc += unpack16( tex.xy ) * 1.0;
			cnt+=1.0;

		// }

	}

	coc /= float( cnt );
	
	vec3 col = vec3( 0.0 );

	cnt = 0.0;

	for( int i = 0; i < SAMPLE_COUNT; i ++  ) {
			
		vec2 offset = poissonDisk[ i ] * coc * 0.1; 
		vec4 tex = texture2D( cocTex, vUv + offset );

		float sampleCoC = unpack16( tex.xy ) + 0.01;

		// if( sampleDepth >= depth ) {

			col += texture2D( sceneTex, vUv + offset ).xyz * sampleCoC;
			cnt += sampleCoC;

		// }
		
	}

	col /= cnt;

	gl_FragColor = vec4( vec3(col), 1.0 );
	// gl_FragColor = vec4( vec3(coc), 1.0 );
	
}