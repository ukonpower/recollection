attribute float num;
uniform float time;
uniform vec3 range;
uniform float contentNum;

void main( void ) {

	vec3 pos = position;

	pos += vec3( -time * 0.5 + sin( time + num * 0.33 ) * 0.2, time * 0.1 + sin( time + num * 0.36 ) * 0.1, 0.0 );
	pos.x -= contentNum * 8.0;
	
	pos = mod( pos, range );
	pos -= range / 2.0;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	gl_PointSize = 20.0 + sin( num * 0.74435 ) * 10.0;

}