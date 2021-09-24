uniform float time;

uniform sampler2D envMap;
uniform float maxLodLevel;

uniform sampler2D roughnessMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;


#pragma glslify: import('./constants.glsl' )

#include <packing>


// Types

struct Geometry {
	vec3 pos;
	vec3 posWorld;
	vec3 viewDir;
	vec3 viewDirWorld;
	vec3 normal;
	vec3 normalWorld;
};

struct Light {
	vec3 direction;
	vec3 color;
};

struct Material {
	vec3 albedo;
	vec3 diffuseColor;
	vec3 specularColor;
	float metalness;
	float roughness;
};

// Directional Light

struct DirectionalLight {
	vec3 direction;
	vec3 color;
};

uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

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

vec3 RE( Geometry geo, Material mat, Light light) {

	vec3 lightDir = normalize( light.direction );
	vec3 halfVec = normalize( geo.viewDir + lightDir );

	float dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );
	float dNH = clamp( dot( geo.normal, halfVec ), 0.0, 1.0 );
	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
	float dNL = clamp( dot( geo.normal, lightDir), 0.0, 1.0 );

	// diffuse

	vec3 diffuse = lambert( dNL ) * mat.diffuseColor;

	// specular

	float D = ggx( dNH, mat.roughness );
	float G = gSmith( dNV, dNL, mat.roughness );
	float F = fresnel( dLH );
	
	vec3 specular = ( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ) * mat.specularColor; 

	vec3 c = vec3( 0.0 );
	c += diffuse * ( 1.0 - F ) + specular;

	return c;

}

void main( void ) {

	Geometry geo;
	geo.pos = vViewPos;
	geo.posWorld = vWorldPos;
	geo.viewDir = normalize( geo.pos );
	geo.viewDirWorld = normalize( geo.posWorld - cameraPosition );
	geo.normal = normalize( vNormal );
	geo.normalWorld = normalize( ( vec4( geo.normal, 0.0 ) * viewMatrix ).xyz );

	#ifdef DEPTH

	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	gl_FragColor = packDepthToRGBA( fragCoordZ );
	return;
	
	#endif

	Material mat;
	mat.albedo = vec3( 1.0 );
	mat.roughness = smoothstep( 0.3, 1.0, texture2D( roughnessMap, vUv ).x );
	mat.roughness = clamp(mat.roughness, 0.000001, 1.0);
	mat.metalness = 0.0;

	mat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );
	mat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );

	vec3 c = vec3( 0.0 );

	#if NUM_DIR_LIGHTS > 0

	Light light;

	#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			light.direction = directionalLights[i].direction;
			light.color = directionalLights[i].color;

			c += RE( geo, mat, light );
			
		}
	#pragma unroll_loop_end

	#endif

	// env
	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );
	vec3 refDir = reflect( geo.viewDirWorld, geo.normalWorld );
	refDir.x *= -1.0;

	float EF = mix( fresnel( dNV ), 1.0, mat.metalness );
	c += mat.diffuseColor * textureCubeUV( envMap, refDir, 1.0 ).xyz * ( 1.0 - mat.metalness ) * ( 1.0 - EF );
	c += mat.specularColor * textureCubeUV( envMap, refDir, mat.roughness ).xyz * EF * TPI;

	gl_FragColor = vec4( vec3(c), 1.0 );

}