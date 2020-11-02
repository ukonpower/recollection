varying vec2 vUv;

void main( void ) {

	vec2 cuv = ( vUv - 0.5 ) * 2.0;

	vec3 col = vec3( 0.04, 0.01, 0.05 );

	gl_FragColor = vec4( col, 1.0 );

}