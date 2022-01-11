varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform float cameraNear;
uniform float cameraFar;

uniform sampler2D sceneTex;
uniform sampler2D depthTex;

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

void main(){

	initPoissonDisk();

	float cnt = 0.0;
	vec3 col = vec3( 0.0 );
	float coc = 1.0;
	
	// float depth = cameraNear + unpackRGBAToDepth( texture2D( depthTex, vUv ) ) * ( cameraFar - cameraNear );
	float depth = unpackRGBAToDepth( texture2D( depthTex, vUv ) );
	depth = texture2D( depthTex, vUv ).x;

	for( int i = 0; i < SAMPLE_COUNT; i ++  ) {
			
		vec2 offset = poissonDisk[ i ] * coc * 0.06;
		
	}

	col /= cnt;
	col = vec3( depth );

	gl_FragColor = vec4( col, 1.0 );
	
}