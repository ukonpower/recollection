varying vec2 vUv;
varying vec4 vPos;
varying float vSize;
varying vec3 vColor;

void main( void ) {

	vec2 uv = gl_PointCoord.xy;

	float circle = 1.0 - length( uv * 2.0 - 1.0 );
	float w = smoothstep( vSize, 1.0, circle ) * 0.5;
	w += smoothstep( 0.9, 1.0, circle );

	float d = vPos.z;
	d = smoothstep( 0.0, 1.0, 1.0 - length( d - 4.0 ) * 0.1 );
	d *= min( 1.0, vPos.z * 0.7 );
	w *= d;
	w = 1.0;
	
	vec4 c = vec4( vColor, 1.0 * w );

	gl_FragColor = c;

}