varying vec2 vUv;
uniform float left;
uniform float top;
uniform float width;
uniform float height;
uniform float visibility;
uniform float index;
uniform float infoVisibility;

varying vec2 vHighPrecisionZW;

#pragma glslify: import('./easings.glsl' )

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	gl_Position.z = 0.01;

	vUv = uv;

	vUv.y = 1.0 - vUv.y;
	vUv.y *= height;
	vUv.y = 1.0 - vUv.y;

	vUv.x += 1.0 - infoVisibility;

	vUv.x *= width;
	vUv.x += left;
	vUv.y -= top;

	float start = (1.0 - index) * 0.3;
	float offsetX = visibility;
	offsetX = smoothstep( start, start + 0.7, offsetX );
	offsetX = 1.0 - easeOutQuart( offsetX );
	vUv.x += ( offsetX * width );

	float offsetYEnd = max( 0.0, visibility - 1.0 );
	offsetYEnd = smoothstep( start, start + 0.7, offsetYEnd );
	offsetYEnd = easeOutQuart( offsetYEnd );
	vUv.y += offsetYEnd * height;
	
	vHighPrecisionZW = gl_Position.zw;

}