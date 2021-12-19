varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D cocTex;

uniform float time;

#include <packing>

#pragma glslify: random = require('./random.glsl' )
#pragma glslify: import('./constants.glsl' )

#define SAMPLE_COUNT 8

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

	vec3 col = vec3( 0.0 );
	float coc = 0.0;
	float cnt = 0.0;

	#ifdef FAR

		for( int i = 0; i < 4; i ++  ) {

			vec2 offset = poissonDisk[ i ] * 0.03; 
			vec4 tex = texture2D( cocTex, vUv + offset );

			coc += unpack16( tex.zw );

		}

		coc /= float( 4 );

		for( int i = 0; i < SAMPLE_COUNT; i ++  ) {
				
			vec2 offset = poissonDisk[ i ] * coc * 0.06; 
			float sampleCoC = unpack16( texture2D( cocTex, vUv + offset ).zw ) + 0.01;

			col += texture2D( sceneTex, vUv + offset ).xyz * sampleCoC;
			cnt += sampleCoC;
			
		}

		col /= cnt;

	#else

		float baseCoc = unpack16( texture2D( cocTex, vUv ).xy );

		for( int i = 0; i < SAMPLE_COUNT; i ++  ) {

			vec2 offset = poissonDisk[ i ] * 0.03; 
			vec4 tex = texture2D( cocTex, vUv + offset );

			if( tex.x + tex.y + tex.z < 3.0 ) {

				coc += unpack16( tex.xy );

			}
			
		}

		coc /= float( SAMPLE_COUNT );

		for( int i = 0; i < SAMPLE_COUNT; i ++  ) {
				
			vec2 offset = poissonDisk[ i ] * coc * 0.06; 
			col += texture2D( sceneTex, vUv + offset ).xyz;
			
		}

		col /= float( SAMPLE_COUNT );

	#endif

	gl_FragColor = vec4( vec3(col), 1.0 );
	
}