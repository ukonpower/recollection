uniform mat4 modelViewMatrixLight;
uniform mat4 projectionMatrixLight;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

varying vec2 vShadowMapUV;
varying float vShadowMapDepth;

void main( void ) {

	vec3 pos = position;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vNormal =  ( normalMatrix * normal );
	vViewPos = -mvPosition.xyz;
	vWorldPos = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;
	vHighPrecisionZW = gl_Position.zw;

	vec4 shadowMapPosition = projectionMatrixLight * ( modelViewMatrixLight * vec4( pos, 1.0 ) );
	vShadowMapUV = shadowMapPosition.xy * 0.5 + 0.5;
	vShadowMapDepth = shadowMapPosition.z * 0.5 + 0.5;
	// vShadowMapDepth = 

}