varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D lensTex;
uniform sampler2D blurTex[RENDER_COUNT];
uniform sampler2D noiseTex;
uniform float brightness;
uniform float time;

uniform float glitch;

void main(){

	vec3 c = vec3( 0.0 );

	c = texture2D( sceneTex, vUv ).xyz;

	c += texture2D(blurTex[ 0 ], vUv ).xyz * 1.0 * brightness;
	c += texture2D(blurTex[ 1 ], vUv ).xyz * 2.0 * brightness;
	c += texture2D(blurTex[ 2 ], vUv ).xyz * 4.0 * brightness;
	c += texture2D(blurTex[ 3 ], vUv ).xyz * 6.0 * brightness;

	vec3 blur = texture2D(blurTex[ 4 ], vUv ).xyz * 8.0 * brightness;
	c += blur;

	c += texture2D( lensTex, vUv ).xyz * blur * 1.2;

	gl_FragColor = vec4( c, 1.0 );

}