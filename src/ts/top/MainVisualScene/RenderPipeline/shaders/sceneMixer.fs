varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D contentTex;

uniform float contentVisibility;

uniform float time;

#pragma glslify: random = require( './random.glsl' );

void main(){

	vec4 sceneCol = texture2D( sceneTex, vUv );
	vec4 contentCol = texture2D( contentTex, vUv );

	vec4 col = mix( sceneCol, contentCol, contentVisibility );
	
	gl_FragColor = vec4( col.xyz, 1.0 );

}