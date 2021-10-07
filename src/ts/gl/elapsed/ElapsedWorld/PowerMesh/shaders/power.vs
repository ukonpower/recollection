uniform mat4 modelViewMatrixLight;
uniform mat4 projectionMatrixLight;

#ifdef REFLECTPLANE

	uniform mat4 textureMatrix;
	varying vec4 vRefUV;
	
#endif

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

varying vec2 vShadowMapUV;
varying float vShadowMapGeoDepth;

void main( void ) {

	vec3 pos = position;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vNormal =  ( normalMatrix * normal );
	vViewPos = -mvPosition.xyz;
	vWorldPos = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;
	vHighPrecisionZW = gl_Position.zw;

	#ifdef REFLECTPLANE

		vRefUV = textureMatrix * vec4( position, 1.0 );
		
	#endif

	vec4 shadowMapPosition = projectionMatrixLight * ( modelViewMatrixLight * vec4( pos, 1.0 ) );
	vShadowMapUV = shadowMapPosition.xy * 0.5 + 0.5;
	vShadowMapGeoDepth = shadowMapPosition.z * 0.5 + 0.5;

}