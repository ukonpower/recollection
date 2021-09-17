uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

#pragma glslify: import('./constants.glsl' )

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

	vec3 normal = normalize( vNormal );
	vec3 viewDir = normalize( vViewPos );
	vec3 lightPos = vec3( 10.0, 10.0, 10.0 );
	vec3 lightDir = normalize( lightPos - vWorldPos );
	vec3 halfVec = normalize( lightDir + normal );

	float dLH = clamp( dot( lightDir, halfVec ), 0.0, 1.0 );
	float dNH = clamp( dot( normal, halfVec ), 0.0, 1.0 );
	float dNV = clamp( dot( normal, viewDir ), 0.0, 1.0 );
	float dNL = clamp( dot( normal, lightDir), 0.0, 1.0 );

	float roughness = 0.2;

	// diffuse

	float diffuse = lambert( dNL );

	// specular

	float D = ggx( dNH, roughness );
	float G = gSmith( dNV, dNL, roughness );
	float F = fresnel( dLH );

	float specular = ( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ); 

	// f
	float f = diffuse * ( 1.0 - F ) + specular;

	gl_FragColor = vec4( vec3( f ), 1.0 );


}