uniform mat4 textureMatrix;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec4 mvpPos;
varying vec4 refUV;

void main( void ) {

	vec3 pos = position;

	vec4 modelPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * mvPosition;

	refUV = textureMatrix * vec4( position, 1.0 );

	vUv = uv;
	vNormal = normalMatrix * normal;
	vViewPosition = -mvPosition.xyz;
	mvpPos = gl_Position;

}