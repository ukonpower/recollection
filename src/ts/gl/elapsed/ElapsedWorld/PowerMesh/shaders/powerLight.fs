uniform float time;
uniform samplerCube envMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

#pragma glslify: import('./constants.glsl' )

struct DirectionalLight {
	vec3 direction;
	vec3 color;
};

uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

struct Geometry {
	vec3 viewPos;
	vec3 worldPos;
	vec3 normal;
	vec3 worldNormal;
};

struct Light {
	vec3 direction;
	vec3 color;
};

struct Material {
	vec3 albedo;
	float metalness;
	float roughness;
};

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

	vec3 viewDir = normalize( geo.viewPos );
	vec3 lightDir = normalize( light.direction );
	vec3 halfVec = normalize( lightDir + geo.normal );
	vec3 worldViewDir = normalize( geo.worldPos - cameraPosition );

	float dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );
	float dNH = clamp( dot( geo.normal, halfVec ), 0.0, 1.0 );
	float dNV = clamp( dot( geo.normal, viewDir ), 0.0, 1.0 );
	float dNL = clamp( dot( geo.normal, lightDir), 0.0, 1.0 );

	// diffuse

	float diffuse = lambert( dNL );

	// specular

	float D = ggx( dNH, mat.roughness );
	float G = gSmith( dNV, dNL, mat.roughness );
	float F = fresnel( dLH );
	
	float specular = ( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ); 

	vec3 c = vec3( 0.0 );
	c += diffuse * ( 1.0 - F ) + specular;

	return c;

}

void main( void ) {

	Geometry geo;
	geo.viewPos = vViewPos;
	geo.worldPos = vWorldPos;
	geo.normal = normalize( vNormal );
	geo.worldNormal = normalize( ( vec4( geo.normal, 0.0 ) * viewMatrix ).xyz );

	Material mat;
	mat.albedo = vec3( 1.0 );
	mat.roughness = 0.1;
	mat.metalness = 0.0;

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

	gl_FragColor = vec4( vec3( c ), 1.0 );


}