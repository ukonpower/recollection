uniform float contentVisibility;
varying vec2 vUv;

void main( void ) {

	vec2 cuv = ( vUv - 0.5 ) * 2.0;

	vec3 col = vec3( 0.12, 0.1, 0.15 );
	col *= ( 1.0 - length( cuv ) );

	col *= 1.0 - contentVisibility;

	gl_FragColor = vec4( col, 1.0 );

}