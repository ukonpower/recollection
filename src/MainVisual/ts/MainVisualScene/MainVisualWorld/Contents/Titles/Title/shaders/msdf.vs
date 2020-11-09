varying vec2 vUv;
uniform float left;
uniform float top;
uniform float width;
uniform float height;
uniform float visibility;
varying vec2 vHighPrecisionZW;

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

	vUv.y = 1.0 - vUv.y;
	vUv.y *= height;
	vUv.y = 1.0 - vUv.y;

	vUv.x *= width;
	vUv.x += left;
	vUv.y -= top;
	vUv.y += ( (1.0 - visibility * 1.0) * height );
	
	vHighPrecisionZW = gl_Position.zw;

}