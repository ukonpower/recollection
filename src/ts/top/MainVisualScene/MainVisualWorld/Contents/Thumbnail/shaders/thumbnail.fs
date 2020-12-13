uniform sampler2D currentTex;
uniform sampler2D nextTex;
uniform float contentFade;
varying vec2 currentUV;
varying vec2 nextUV;

void main( void ) {

	vec4 currentCol = texture2D( currentTex, currentUV );
	currentCol.xyz *= step( abs(currentUV.x - 0.5) , 0.5 ) * step( abs(currentUV.y - 0.5) , 0.5 );

	vec4 nextCol = texture2D( nextTex, nextUV );
	nextCol.xyz *= step( abs(nextUV.x - 0.5) , 0.5 ) * step( abs(nextUV.y - 0.5) , 0.5 );

	float w = contentFade;

	vec4 col = mix( currentCol, nextCol, w );
	col.xyz *= 0.6;

	gl_FragColor = col;

}