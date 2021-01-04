varying vec2 vUv;
varying vec2 vHighPrecisionZW;
uniform float contentVisibility;

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos * contentVisibility, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	gl_Position = mix( gl_Position, vec4( pos.xy, 0.01, 1.0 ), contentVisibility );
	
	vHighPrecisionZW = gl_Position.zw ;
	vUv = vec2( uv.x, 1.0 - uv.y );

}