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

void main(){

	vec2 uv = vUv;
	vec2 cUV = ( uv - 0.5 ) * 2.0;

	vec2 noiseUV = vec2( atan( cUV.x, cUV.y ) * 0.1, 0.0 );
	vec4 noiseCol = texture2D( noiseTex, noiseUV );

	cUV.x *= windowAspect;

	float v = smoothstep( 0.2, 1.0, contentVisibility );
	float w = smoothstep( 0.0, -0.8, length( cUV + (noiseCol.xy - 0.5) * 0.4 ) - v * 2.5 );


	vec4 sceneCol = texture2D( sceneTex, uv + (noiseCol.xy - 0.5) * (v ) * sin(w * PI) );
	vec4 contentCol = texture2D( contentTex, uv + (noiseCol.xy - 0.5) * (v ) * sin(w * PI) );	

	vec4 col = mix( sceneCol, contentCol, w );
	
	gl_FragColor = vec4( col.xyz, 1.0 );

}