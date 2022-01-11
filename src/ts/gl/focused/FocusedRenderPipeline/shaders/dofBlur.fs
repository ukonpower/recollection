varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D cocTex;

uniform float time;

#include <packing>

#pragma glslify: random = require('./random.glsl' )
#pragma glslify: import('./constants.glsl' )

#define SAMPLE_COUNT 16

vec2 poissonDisk[ SAMPLE_COUNT ];

void initPoissonDisk() {

	float r = 1.0 / float( SAMPLE_COUNT );
	float rStep = r;

	float ang = random( gl_FragCoord.xy * 0.01 + sin(time) ) * TPI;
	ang = 0.0;
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

void main(){

	initPoissonDisk();

	float baseCoc = texture2D( cocTex, vUv ).x * 2.0 - 1.0;
	float blurSize = abs( baseCoc ) * 0.1;

	vec3 col = vec3( 0.0 );
	float cnt = 0.0;

	for( int i = 0; i < SAMPLE_COUNT; i ++  ) {
				
		vec2 offset = poissonDisk[ i ] * blurSize * 0.1; 
		vec2 sampleUV = vUv + offset;

		float sampleCoc = texture2D( cocTex, sampleUV ).x * 2.0 - 1.0;

		if( sampleCoc >= baseCoc  ) {

			col += texture2D( sceneTex, sampleUV ).xyz;
			cnt += 1.0;
			
		}
		
	}

	col /= cnt;

	// col = vec3( baseCoc );

	gl_FragColor = vec4( col, abs( baseCoc ) );
	
}