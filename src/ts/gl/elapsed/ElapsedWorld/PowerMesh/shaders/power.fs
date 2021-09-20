uniform float time;

uniform sampler2D envMap;
uniform float maxLodLevel;

uniform sampler2D roughnessMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

#pragma glslify: import('./constants.glsl' )

// TextureCubeUV
#define ENVMAP_TYPE_CUBE_UV
vec4 envMapTexelToLinear( vec4 value ) { return GammaToLinear( value, float( GAMMA_FACTOR ) ); }
#include <cube_uv_reflection_fragment>

float ggx( float dNH, float roughness ) {
	
	float a2 = roughness * roughness;
	a2 = a2 * a2;
	float dNH2 = dNH * dNH;

	if( dNH2 <= 0.0 ) return 0.0;

	return a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );

}

float lambert( float dNL ) {

	return dNL / PI;

}

float gSchlick( float d, float k ) {

	return d / (d * ( 1.0 - k ) + k );
	
}

float gSmith( float dNV, float dNL, float roughness ) {

	float k = clamp( dot( roughness, sqrt( 2.0 / PI ) ), 0.0, 1.0 );
	return gSchlick( dNV, k ) * gSchlick( dNL, k );
	
}

float fresnel( float d ) {
	
	float f0 = 0.04;

	return f0 + ( 1.0 - f0 ) * pow( 1.0 - d, 5.0 );

}

void main( void ) {

	vec3 worldNormal = normalize( (vec4( vNormal, 0.0 ) * viewMatrix).xyz );
	vec3 normal = normalize( vNormal );
	vec3 viewDir = normalize( vViewPos );
	vec3 lightDir = normalize( vec3( 1.0, 1.0, 1.0 ) );
	vec3 halfVec = normalize( lightDir + normal );
	vec3 worldViewDir = normalize( vWorldPos - cameraPosition );

	float dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );
	float dNH = clamp( dot( normal, halfVec ), 0.0, 1.0 );
	float dNV = clamp( dot( normal, viewDir ), 0.0, 1.0 );
	float dNL = clamp( dot( normal, lightDir), 0.0, 1.0 );

	float roughness = smoothstep( 0.3, 1.0, texture2D( roughnessMap, vUv ).x );
	roughness = clamp(roughness, 0.000001, 1.0);

	vec3 albedo = vec3( 1.0 );
	float metalness = 0.0;

	vec3 diffuseColor = mix( albedo, vec3( 0.0, 0.0, 0.0 ), metalness );
	vec3 specularColor = mix( vec3( 1.0, 1.0, 1.0 ), albedo, metalness );

	// diffuse
	vec3 diffuse = diffuseColor * lambert( dNL );

	// specular
	float D = ggx( dNH, roughness );
	float G = gSmith( dNV, dNL, roughness );
	float F = fresnel( dLH );
	vec3 specular = specularColor * ( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ); 

	vec3 c = vec3( 0.0 );
	c += diffuse * ( 1.0 - F ) + specular;

	// env
	vec3 refDir = reflect( worldViewDir, worldNormal );
	refDir.x *= -1.0;
	float EF = mix( fresnel( dNV ), 1.0, metalness );
	c += textureCubeUV( envMap, refDir, 1.0 ).xyz * ( 1.0 - metalness ) * diffuseColor * ( 1.0 - EF ) ;
	c += specularColor * textureCubeUV( envMap, refDir, roughness ).xyz * EF * PI;

	gl_FragColor = vec4( vec3(c), 1.0);


}