
varying vec2 vUv;

void main( void ) {

	vec2 cuv = vUv * 2.0 - 1.0;

	float alpha = smoothstep( 0.0, 1.0, length( cuv ) );
	alpha = exp( alpha * - 10.0 ) * 0.2;

	gl_FragColor = vec4( vec3( 1.0 ), alpha );

}