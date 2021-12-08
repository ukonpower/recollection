varying vec2 vUv;

/*-------------------------------
	Requiers
-------------------------------*/

#pragma glslify: random = require('./random.glsl' )

/*-------------------------------
	Material Uniforms
-------------------------------*/

uniform float time;

/*-------------------------------
	Textures
-------------------------------*/

#ifdef USE_MAP

	uniform sampler2D map;

#else

	uniform vec3 color;

#endif

#ifdef USE_NORMAL_MAP

	uniform sampler2D normalMap;

#endif

#ifdef USE_ROUGHNESS_MAP

	uniform sampler2D roughnessMap;

#else

	uniform float roughness;

#endif

#ifdef USE_ALPHA_MAP

	uniform sampler2D alphaMap;

#else

	uniform float opacity;
	
#endif

#ifdef USE_METALNESS_MAP

	uniform sampler2D metalnessMap;

#else

	uniform float metalness;

#endif

#ifdef REFLECTPLANE

	uniform sampler2D reflectionTex;
	uniform vec2 renderResolution;
	uniform vec2 mipMapResolution;
	
#endif

#pragma glslify: import('./constants.glsl' )

/*-------------------------------
	Packing
-------------------------------*/

#include <packing>

vec2 packing16( float value ) { 

	float v1 = value * 255.0;
	float r = floor(v1);

	float v2 = ( v1 - r ) * 255.0;
	float g = floor( v2 );

	return vec2( r, g ) / 255.0;

}


/*-------------------------------
	Types
-------------------------------*/

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
	float opacity;
};

/*-------------------------------
	Lights
-------------------------------*/

#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

#endif

#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif

/*-------------------------------
	EnvMap
-------------------------------*/

uniform sampler2D envMap;
uniform float maxLodLevel;

#define ENVMAP_TYPE_CUBE_UV
vec4 envMapTexelToLinear( vec4 value ) { return GammaToLinear( value, float( GAMMA_FACTOR ) ); }
#include <cube_uv_reflection_fragment>

/*-------------------------------
	Reflection
-------------------------------*/

#define REF_MIPMAP_LEVEL 8.0

#ifdef REFLECTPLANE

	uniform vec3 a;

	vec2 getRefMipmapUV( vec2 uv, float level ) {

		vec2 ruv = uv;

		if( level > 0.0 ) {

			ruv.x *= 1.0 / ( 3.0 * ( pow( 2.0, level ) / 2.0 ) );
			ruv.y *= 1.0 / ( pow( 2.0, level ) );
			ruv.y += 1.0 / ( pow( 2.0, level ) );
			ruv.x += 1.0 / 1.5;
		
		} else {

			ruv.x /= 1.5;
			
		}

		return ruv;

	}
	
	vec4 cubic(float v) {
		vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
		vec4 s = n * n * n;
		float x = s.x;
		float y = s.y - 4.0 * s.x;
		float z = s.z - 4.0 * s.y + 6.0 * s.x;
		float w = 6.0 - x - y - z;
		return vec4(x, y, z, w);
	}

	// https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl
	vec4 textureBicubic(sampler2D t, vec2 texCoords, vec2 textureSize) {
		vec2 invTexSize = 1.0 / textureSize;
		texCoords = texCoords * textureSize - 0.5;
		vec2 fxy = fract(texCoords);
		texCoords -= fxy;
		vec4 xcubic = cubic(fxy.x);
		vec4 ycubic = cubic(fxy.y);
		vec4 c = texCoords.xxyy + vec2 (-0.5, 1.5).xyxy;
		vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
		vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;
		offset *= invTexSize.xxyy;
		vec4 sample0 = texture2D(t, offset.xz);
		vec4 sample1 = texture2D(t, offset.yz);
		vec4 sample2 = texture2D(t, offset.xw);
		vec4 sample3 = texture2D(t, offset.yw);
		float sx = s.x / (s.x + s.y);
		float sy = s.z / (s.z + s.w);
		return mix(
		mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
	}

#endif

/*-------------------------------
	Shadow
-------------------------------*/

#ifdef DEPTH

	varying vec2 vHighPrecisionZW;

#else

	uniform sampler2D shadowMap;
	uniform vec2 shadowMapSize;

	uniform vec2 shadowLightCameraClip;
	uniform float shadowLightSize;
	uniform vec3 shadowLightDirection;
	varying vec3 vShadowMapCoord;

	#define SHADOW_SAMPLE_COUNT 16

	vec2 poissonDisk[ SHADOW_SAMPLE_COUNT ];

	void initPoissonDisk() {

		float r = 1.0 / float( SHADOW_SAMPLE_COUNT );
		float rStep = r;

		float ang = random( gl_FragCoord.xy * 0.01 + sin(time) ) * TPI;
		float angStep = rStep * TPI * 11.0;

		for( int i = 0; i < SHADOW_SAMPLE_COUNT; i++ ) {
			
			poissonDisk[ i ] = vec2(
				sin( ang ),
				cos( ang )
			) * pow( r, 0.75 );

			r += rStep;
			ang += angStep;
		}
		
	}

	vec2 compairShadowMapDepth( sampler2D shadowMap, vec2 shadowMapUV, float depth, vec2 shadowLightCameraClip, float depthBias ) {

		if( 0.0 <= shadowMapUV.x && shadowMapUV.x <= 1.0 && 0.0 <= shadowMapUV.y && shadowMapUV.y <= 1.0 ) {

			float shadowMapDepth = unpackRGBAToDepth( texture2D( shadowMap, shadowMapUV ) );
			float shadow = depth < shadowMapDepth + ( depthBias / ( shadowLightCameraClip.y - shadowLightCameraClip.x ) ) ? 1.0 : 0.0;

			if( 0.0 < shadowMapDepth && shadowMapDepth <= shadowLightCameraClip.x + shadowLightCameraClip.y ) {

				return vec2( shadow, shadowMapDepth );
				
			}

		}

		return vec2( 1.0, 0.0 );
		
	}

	float shadowMapPCF( sampler2D shadowMap, vec2 shadowMapSize, vec3 shadowMapCoord, float shadowSize, vec2 shadowLightCameraClip, float depthBias ) {

		float shadow = 0.0;
		for( int i = 0; i < SHADOW_SAMPLE_COUNT; i ++  ) {
			
			vec2 offset = poissonDisk[ i ] * (shadowSize / shadowMapSize); 

			shadow += compairShadowMapDepth( shadowMap, shadowMapCoord.xy + offset, shadowMapCoord.z, shadowLightCameraClip, depthBias + shadowSize ).x;
			
		}

		shadow /= float( SHADOW_SAMPLE_COUNT );

		return shadow;

	}

	float shadowMapPCSS( sampler2D shadowMap, vec2 shadowMapSize, vec3 shadowMapCoord, vec2 shadowLightCameraClip, float dNL ) {

		initPoissonDisk();

		float bias = 0.01 + ( 1.0 - dNL ) * 0.05;

		int numBlockers = 0;
		float avgDepth = 0.0;

		for( int i = 0; i < SHADOW_SAMPLE_COUNT; i ++ ) {

			vec2 offset = poissonDisk[ i ] * ( 0.2 / shadowMapSize ) * dNL; 
			vec2 shadow = compairShadowMapDepth( shadowMap, shadowMapCoord.xy + offset, shadowMapCoord.z, shadowLightCameraClip, bias );

			if( shadow.x == 0.0 ) {

				avgDepth += shadow.y;
				numBlockers ++;
				
			}
			
		}

		if( numBlockers == 0 ) {

			return 1.0;

		}

		// if( numBlockers == SHADOW_SAMPLE_COUNT ) {

		// 	return 0.0;
			
		// }

		avgDepth /= float( numBlockers );

		float shadowSize = ( ( shadowMapCoord.z - avgDepth ) * shadowLightSize ) / ( avgDepth ) * dNL;
		float shadow = shadowMapPCF( shadowMap, shadowMapSize, shadowMapCoord, shadowSize, shadowLightCameraClip, bias );
		
		return shadow;

	}

#endif

/*-------------------------------
	RE
-------------------------------*/

varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

float ggx( float dNH, float roughness ) {
	
	float a2 = roughness * roughness;
	a2 = a2 * a2;
	float dNH2 = dNH * dNH;

	if( dNH2 <= 0.0 ) return 0.0;

	return a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );

}

vec3 lambert( vec3 diffuseColor ) {

	return diffuseColor / PI;

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

	vec3 irradiance = light.color * dNL;

	// diffuse
	vec3 diffuse = lambert( mat.diffuseColor ) * irradiance;

	// specular
	float D = ggx( dNH, mat.roughness );
	float G = gSmith( dNV, dNL, mat.roughness );
	float F = fresnel( dLH );
	
	vec3 specular = (( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ) * mat.specularColor ) * irradiance; 

	vec3 c = vec3( 0.0 );
	c += diffuse * ( 1.0 - F ) + specular;

	return c;

}

/*-------------------------------
	Main
-------------------------------*/

void main( void ) {

	/*-------------------------------
		Material
	-------------------------------*/

	Material mat;

	#ifdef USE_MAP

		vec4 color = texture2D( map, vUv );
		mat.albedo = color.xyz;

	#else

		mat.albedo = pow( color.xyz, vec3( 1.0 / 2.2 ) );
		mat.opacity = 1.0;
	
	#endif

	#ifdef USE_ROUGHNESS_MAP

		mat.roughness = texture2D( roughnessMap, vUv ).y;

	#else

		mat.roughness = roughness;
	
	#endif

	#ifdef USE_METALNESS_MAP

		mat.metalness = texture2D( roughnessMap, vUv ).z;

	#else

		mat.metalness = metalness;
	
	#endif

	#ifdef USE_ALPHA_MAP

		mat.opacity = texture2D( alphaMap, vUv ).x;

	#else

		mat.opacity = opacity;

	#endif
	
	if( mat.opacity < 0.5 ) discard;

	mat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );
	mat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );

	// output
	vec3 outColor = vec3( 0.0 );
	float outOpacity = mat.opacity;

	/*-------------------------------
		Depth
	-------------------------------*/

	#ifdef DEPTH

		#ifdef COC

			float focalLength = 0.8;
			float focusLength = 4.0;
			float fNumber = 1.0;
			float d = vViewPos.z;

			float coc = ( abs( d - focusLength ) / d ) * 
						(focalLength * focalLength) / (fNumber * ( focusLength - focalLength) ) *
						1.0 / 1.0;

			gl_FragColor = packDepthToRGBA( coc );
			
		#else

			float fragCoordZ = 0.5 * vHighPrecisionZW.x / vHighPrecisionZW.y + 0.5;
			gl_FragColor = packDepthToRGBA( fragCoordZ );

		#endif

		return;
	
	#endif

	/*-------------------------------
		Geometry
	-------------------------------*/

	Geometry geo;
	geo.pos = -vViewPos;
	geo.posWorld = vWorldPos;
	geo.viewDir = normalize( vViewPos );
	geo.viewDirWorld = normalize( geo.posWorld - cameraPosition );
	geo.normal = normalize( vNormal );

	#ifdef USE_NORMAL_MAP

		vec2 nUV = vUv;
		vec3 mapN = texture2D( normalMap, vUv ).xyz;
		mapN.xy = 1.0 - mapN.xy;
		mapN = mapN * 2.0 - 1.0;

		// https://stackoverflow.com/Questions/5255806/how-to-calculate-tangent-and-binormal
		// compute derivations of the world position
		vec3 p_dx = dFdx(vWorldPos);
		vec3 p_dy = dFdy(vWorldPos);
		// compute derivations of the texture coordinate
		vec2 tc_dx = dFdx(vUv);
		vec2 tc_dy = dFdy(vUv);
		// compute initial tangent and bi-tangent
		vec3 t = normalize( tc_dy.y * p_dx - tc_dx.y * p_dy );
		vec3 b = normalize( tc_dy.x * p_dx - tc_dx.x * p_dy ); // sign inversion
		// get new tangent from a given mesh normal
		vec3 n = normalize(geo.normal);
		vec3 x = cross(n, t);
		t = cross(x, n);
		t = normalize(t);
		// get updated bi-tangent
		x = cross(b, n);
		b = cross(n, x);
		b = normalize(b);

		mat3 tbn = mat3(t, b, n);
		geo.normal = normalize( tbn * mapN );

	#endif

	geo.normalWorld = normalize( ( vec4( geo.normal, 0.0 ) * viewMatrix ).xyz );

	/*-------------------------------
		Lighting
	-------------------------------*/

	float shadow = 1.0;
	
	#ifndef DEPTH

		shadow *= shadowMapPCSS( shadowMap, shadowMapSize, vShadowMapCoord, shadowLightCameraClip, dot( geo.normalWorld, -shadowLightDirection ) );

	#endif
	
	Light light;

	#if NUM_DIR_LIGHTS > 0

		#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

				light.direction = directionalLights[ i ].direction;
				light.color = directionalLights[ i ].color;
				outColor += RE( geo, mat, light ) * shadow;
				
			}
		#pragma unroll_loop_end

	#endif

	#if NUM_POINT_LIGHTS > 0

		PointLight pLight;

		#pragma unroll_loop_start

			for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

				pLight = pointLights[ i ];

				vec3 v = pLight.position - geo.pos;
				float d = length( v );
				light.direction = normalize( v );
		
				light.color = pLight.color;

				if( pLight.distance > 0.0 && pLight.decay > 0.0 ) {

					float attenuation = pow( clamp( -d / pLight.distance + 1.0, 0.0, 1.0 ), pLight.decay );
					light.color *= attenuation;

				}

				outColor += RE( geo, mat, light );
				
			}
			
		#pragma unroll_loop_end

	#endif

	/*-------------------------------
		Environment Lighting
	-------------------------------*/

	float dNV = clamp( dot( geo.normal, geo.viewDir ), 0.0, 1.0 );

	vec3 refDir = reflect( geo.viewDirWorld, geo.normalWorld );
	refDir.x *= -1.0;

	float EF = mix( fresnel( dNV ), 1.0, mat.metalness );
	outColor += mat.diffuseColor * textureCubeUV( envMap, geo.normalWorld, 1.0 ).xyz * ( 1.0 - mat.metalness ) * ( 1.0 - EF );

	/*-------------------------------
		Reflection
	-------------------------------*/
	
	#ifdef REFLECTPLANE
	
		vec2 refUV = gl_FragCoord.xy / renderResolution;

		refUV.x += geo.normal.x * 0.5;

		float l = (1.0 - exp( -mat.roughness  ) ) * 1.6 * REF_MIPMAP_LEVEL;

		float offset1 = floor( l );
		float offset2 = offset1 + 1.0;
		float blend = fract( l );
		
		vec2 ruv1 = getRefMipmapUV( refUV, offset1 );
		vec2 ruv2 = getRefMipmapUV( refUV, offset2 );

		vec3 ref1 = textureBicubic( reflectionTex, ruv1, mipMapResolution ).xyz;
		vec3 ref2 = textureBicubic( reflectionTex, ruv2, mipMapResolution ).xyz;

		outColor += mix( ref1, ref2, blend ) * EF;

	#else
	
		outColor += mat.specularColor * textureCubeUV( envMap, refDir, mat.roughness ).xyz * EF;
	
	#endif

	gl_FragColor = vec4( outColor, outOpacity );
}