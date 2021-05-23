varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main( void ) {

	vec3 pos = position;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vPos = ( modelMatrix * vec4( pos, 1.0 ) ).xyz;
	vNormal = ( modelMatrix * vec4( normal, 1.0 ) ).xyz;
	vUv = uv;

}