attribute vec3 offsetPos;
attribute float num;

uniform float time;
uniform vec3 range;
uniform float contentNum;
varying vec2 vUv;

void main( void ) {

	vec3 pos = position;

	vec3 oPos = offsetPos;

	oPos += vec3( time * 0.5 + sin( time + num * 0.33 ) * 0.2, time * 0.1 + sin( time + num * 0.36 ) * 0.1, 0.0 );
	oPos.x -= contentNum * 8.0;
	
	oPos = mod( oPos, range );
	oPos -= range / 2.0;
	pos += oPos;


	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = vec2( uv.x, 1.0 - uv.y );

}