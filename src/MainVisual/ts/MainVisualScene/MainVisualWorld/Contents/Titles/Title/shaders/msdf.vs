varying vec2 vUv;
uniform float left;
uniform float top;
uniform float width;
uniform float height;
uniform float visibility;
uniform float index;
varying vec2 vHighPrecisionZW;

#pragma glslify: import('./easings.glsl' )

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

	float start = index * .3;
	float offsetY = visibility;
	offsetY = smoothstep( start, start + 0.7, offsetY );
	offsetY = 1.0 - easeOutQuart( offsetY );
	vUv.x -= ( offsetY * width );

	float offsetYEnd = max( 0.0, visibility - 1.0 );
	offsetYEnd = smoothstep( start, start + 0.7, offsetYEnd );
	offsetYEnd = easeOutQuart( offsetYEnd );
	vUv.y += offsetYEnd * height;
	
	vHighPrecisionZW = gl_Position.zw;

}