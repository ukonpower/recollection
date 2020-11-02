varying vec2 vUv;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;

	pos.xz = vec2( -4.0, 0.0 );
	pos.xz *= rotate( -uv.x * PI );	
	pos.y *= 6.0;
	pos.z *= 0.5;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}