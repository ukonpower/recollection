
void main( void ) {

	vec2 uv = gl_PointCoord.xy;

	vec2 cuv = uv * 2.0 - 1.0;

	float l = length( cuv );
	float alpha;

	alpha = smoothstep( 1.0, 0.8, l );
	
	if( alpha < 0.5 ) discard;
	
	alpha *= smoothstep( -0.1, 1.0, l ) * 0.3 + 0.3;

	alpha *= 0.05;

	gl_FragColor = vec4( vec3( 1.0 ), alpha );

}