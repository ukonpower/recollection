uniform sampler2D currentTex;
uniform sampler2D nextTex;
uniform float contentFade;
varying vec2 currentUV;
varying vec2 nextUV;

void main( void ) {

	vec4 currentCol = texture2D( currentTex, currentUV );
	vec4 nextCol = texture2D( nextTex, nextUV );

	float w = contentFade;

	vec4 col = mix( currentCol, nextCol, w );
	col.xyz *= 0.3;

	gl_FragColor = col;

}