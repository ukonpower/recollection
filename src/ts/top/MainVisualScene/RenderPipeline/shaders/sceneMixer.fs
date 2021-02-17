varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D noiseTex;
uniform sampler2D sceneTex;
uniform sampler2D contentTex;

uniform float contentVisibility;
uniform float windowAspect;
uniform float time;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: random = require( './random.glsl' );
#pragma glslify: rotate = require('./rotate.glsl' )

void main(){

	vec2 uv = vUv;
	vec2 contentUV = uv;
	vec2 cUV = ( uv - 0.5 ) * 2.0;


	cUV.x *= windowAspect;
	cUV *= rotate( -max( 0.0, 1.0 - length( cUV ) )* 3.0 * (1.0 - contentVisibility) );
	
	vec2 noiseUV = vec2( atan( cUV.x, cUV.y ) * 0.1, 0.0 );
	vec4 noiseCol = texture2D( noiseTex, noiseUV );

	float v = smoothstep( 0.45, 1.0, contentVisibility );
	float w = smoothstep( 0.0, -1.5, length( cUV + (noiseCol.xy - 0.5) * 0.4 ) - v * 2.5 * max( 1.2 ,windowAspect * 0.8) );

	vec4 sceneCol = texture2D( sceneTex, uv + (noiseCol.xy - 0.5) * ( 1.0 ) * sin(w * PI) );

	vec4 contentCol = vec4( 0.0 );
	for( int i = 0; i < 3; i ++ ) {
		
		vec2 vig = (noiseCol.xy - 0.5) * sin(w * PI) * ( ( float(i) / 3.0 ) * 0.5 + 0.5 );
		
		vec3 rsrc = texture2D( contentTex, contentUV + vig * 2.0 ).xyz;
		vec3 gsrc = texture2D( contentTex, contentUV + vig * 1.8 ).xyz;
		vec3 bsrc = texture2D( contentTex, contentUV + vig * 1.5 ).xyz;

		float r = mix( dot( rsrc.xyz, vec3(0.29891, 0.58661, 0.11448) ), rsrc.x, smoothstep( 0.7, 1.0, v) );
		float g = mix( dot( gsrc.xyz, vec3(0.29891, 0.58661, 0.11448) ), gsrc.y, smoothstep( 0.7, 1.0, v) );
		float b = mix( dot( bsrc.xyz, vec3(0.29891, 0.58661, 0.11448) ), bsrc.z, smoothstep( 0.7, 1.0, v) );

		contentCol += vec4( r, g, b, 1.0 );

	}

	contentCol /= 3.0;


	vec4 col = mix( sceneCol, contentCol, w );
	
	gl_FragColor = vec4( col.xyz, 1.0 );

}