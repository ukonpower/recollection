attribute float num;
uniform float time;
uniform vec3 range;
uniform float contentNum;
uniform float particleSize;

void main( void ) {

	vec3 pos = position;

	pos += vec3( -time * 0.03 + sin( time + num * 0.03 ) * 0.02,  sin( time + num * 0.36 ) * 0.02, 0.0 );
	pos = mod( pos, range );
	pos -= range / 2.0;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	gl_PointSize = ( 100.0 * (smoothstep( 0.9, 0.6, ( ( gl_Position.z / gl_Position.w ) * 0.5 + 0.5 ) ) + 0.03 ) ) * particleSize;

}