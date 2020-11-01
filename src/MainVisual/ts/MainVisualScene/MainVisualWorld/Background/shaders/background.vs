varying vec2 vUv;
varying vec2 vHighPrecisionZW;
void main( void ) {

	vec3 pos = position;

	gl_Position = vec4( pos.xy, 0.9999999, 1.0 );

	vUv = uv;
	vHighPrecisionZW = gl_Position.zw ;

}