uniform float time;

varying vec2 vUv;

void main( void ) {

	vec3 pos = position;

	float w = sin( uv.x  * 16.0 + time ) * 0.5 + 0.5;
	w *= sin( uv.x  * 14.0 + time * 2.0 ) * 0.5 + 0.5;

	pos.x += w * 1.2 * ( uv.y );
	pos.y += w * 0.5 * ( uv.y );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}