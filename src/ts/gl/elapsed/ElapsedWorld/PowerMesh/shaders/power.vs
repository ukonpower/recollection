varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

void main( void ) {

	vec3 pos = position;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vNormal = ( normalMatrix * normal );
	vViewPos = -mvPosition.xyz;
	vWorldPos = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;

}