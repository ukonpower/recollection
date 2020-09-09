varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D blurTex[RENDER_COUNT];
uniform float brightness;

void main(){

	vec4 sceneTex = texture2D( sceneTex, vUv );

	vec4 c = sceneTex;

	#pragma unroll_loop_start
	for ( int i = 0; i < 5; i ++ ) {

        c += texture2D(blurTex[ i ], vUv) * brightness;

    }
	#pragma unroll_loop_end

	gl_FragColor = c;

}