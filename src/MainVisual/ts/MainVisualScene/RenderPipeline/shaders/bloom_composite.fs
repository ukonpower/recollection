varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D lensTex;
uniform sampler2D blurTex0;
uniform sampler2D blurTex1;
uniform sampler2D blurTex2;
uniform sampler2D blurTex3;
uniform sampler2D blurTex4;
uniform sampler2D noiseTex;
uniform float brightness;
uniform float time;

uniform float glitch;

void main(){

	vec3 c = vec3( 0.0 );

	c = texture2D( sceneTex, vUv ).xyz;

	c += texture2D(blurTex0, vUv ).xyz * 1.0 * brightness;
	c += texture2D(blurTex1, vUv ).xyz * 2.0 * brightness;
	c += texture2D(blurTex2, vUv ).xyz * 4.0 * brightness;
	c += texture2D(blurTex3, vUv ).xyz * 6.0 * brightness;
	c += texture2D(blurTex4, vUv ).xyz * 8.0 * brightness;

	gl_FragColor = vec4( c, 1.0 );

}