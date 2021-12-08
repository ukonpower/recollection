varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

varying vec3 vShadowMapCoord;

uniform mat4 shadowLightModelViewMatrix;
uniform mat4 shadowLightProjectionMatrix;

void main( void ) {

	vec3 pos = position;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vNormal = ( normalMatrix * normal );
	vViewPos = -mvPosition.xyz;
	vWorldPos = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;
	vHighPrecisionZW = gl_Position.zw;

	vec4 shadowPos = ( shadowLightProjectionMatrix * ( shadowLightModelViewMatrix * vec4( pos, 1.0 ) ) );
	vShadowMapCoord = shadowPos.xyz / shadowPos.w * 0.5 + 0.5;
	 

}