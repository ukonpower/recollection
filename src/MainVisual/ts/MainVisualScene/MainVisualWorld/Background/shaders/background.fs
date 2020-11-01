varying vec2 vUv;

void main( void ) {

	vec2 cuv = ( vUv - 0.5 ) * 2.0;

	float w = smoothstep( -1.0, 0.7, 1.0 - length( cuv ) );
	vec3 col = mix( vec3( 0.0, 0.0, 0.0 ), vec3( 0.05, 0.1, 0.15 ), w );

	gl_FragColor = vec4( col, 1.0 );

}