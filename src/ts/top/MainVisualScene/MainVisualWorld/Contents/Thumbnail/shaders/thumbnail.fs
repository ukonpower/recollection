uniform sampler2D currentTex;
uniform sampler2D nextTex;
uniform float contentFade;

uniform float loaded1;
uniform float loaded2;
uniform float loading;

varying vec2 currentUV;
varying vec2 nextUV;
varying vec2 vUv;

void main( void ) {

	vec4 currentCol = texture2D( currentTex, currentUV );
	currentCol.xyz *= step( abs(currentUV.x - 0.5) , 0.5 ) * step( abs(currentUV.y - 0.5) , 0.5 ) * smoothstep( 0.5, 0.1, abs( currentUV.x - 0.5 ) );

	vec4 nextCol = texture2D( nextTex, nextUV );
	nextCol.xyz *= step( abs(nextUV.x - 0.5) , 0.5 ) * step( abs(nextUV.y - 0.5) , 0.5 ) * smoothstep( 0.5, 0.1, abs( nextUV.x - 0.5 ) );

	float w = contentFade;

	vec4 col = mix( currentCol, nextCol, w );
	col.xyz *= 0.9;
	col.xyz *= smoothstep( 0.8, 0.0, abs(vUv.y - 0.5)) * loaded2;

	col += step( 1.0, ( 1.0 - abs( vUv.x - 0.5 ) * 2.5) + loading ) * ( 1.0 - loaded2 );

	gl_FragColor = col;

}