varying vec2 vUv;

void main( void ) {

	vec3 pos = position;
	gl_Position = vec4( pos, 1.0 );

	vUv = uv;;

}