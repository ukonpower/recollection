uniform float loaded2;

void main( void ) {

	vec2 uv = gl_PointCoord.xy;

	vec2 cuv = uv * 2.0 - 1.0;

	float alpha = smoothstep( 0.0, 1.0, length( cuv ) );
	alpha = exp( alpha * - 10.0 ) * 0.2;
	alpha *= loaded2;

	gl_FragColor = vec4( vec3( 1.0 ), alpha );

}