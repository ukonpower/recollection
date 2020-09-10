varying vec2 vUv;

uniform sampler2D backbuffer;
uniform sampler2D raymarchTex;

void main( void ) {

	vec4 sceneCol = texture2D( backbuffer, vUv );
	vec4 raymarchCol = texture2D( raymarchTex, vec2( vUv.x, 1.0 - vUv.y ) );

	vec4 col = sceneCol;
	
	gl_FragColor = col;

}