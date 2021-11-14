uniform float time;
varying vec2 vUv;

#pragma glslify: noise2D = require('./noise2D.glsl' )

/*-------------------------------
	Material Uniforms
-------------------------------*/

uniform vec3 color;
uniform sampler2D noiseTex;
uniform sampler2D skyTex;


/*-------------------------------
	Textures
-------------------------------*/

#ifdef USE_MAP
	uniform sampler2D map;
#endif

#ifdef USE_NORMAL_MAP
	uniform sampler2D normalMap;
#endif

#ifdef USE_ROUGHNESS_MAP
	uniform sampler2D roughnessMap;
#endif

#ifdef USE_ALPHA_MAP
	uniform sampler2D alphaMap;
#endif

#ifdef REFLECTPLANE

	uniform sampler2D reflectionTex;
	uniform vec2 renderResolution;
	uniform vec2 mipMapResolution;
	
#endif

uniform sampler2D waterRoughness;

#pragma glslify: import('./constants.glsl' )

#include <packing>

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
	ShadowMap
-------------------------------*/

uniform sampler2D shadowMapTex;
uniform vec2 shadowMapResolution;
varying vec2 vShadowMapUV;
varying float vShadowMapGeoDepth;
varying vec2 vHighPrecisionZW;

float compairShadowMapDepth(  float geoDepth, sampler2D shadowMapTex, vec2 shadowMapUV ) {

	float shadowMapTexDepth = unpackRGBAToDepth( texture2D( shadowMapTex, shadowMapUV ) );
	float shadow = step( geoDepth - shadowMapTexDepth, 0.00001 );
	shadow = mix( 1.0, shadow, step( abs( shadowMapUV.x - 0.5 ), 0.5 ) );
	shadow = mix( 1.0, shadow, step( abs( shadowMapUV.y - 0.5 ), 0.5 ) );

	return shadow;
	
}

float shadowMapPCF( float shadowRadius ) {

	float shadow = 0.0;
	vec2 d = (1.0 / shadowMapResolution) * shadowRadius;
	vec2 hd = d / 2.0;
	
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -d.x, -d.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -hd.x, -d.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( hd.x, -d.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( d.x, -d.y ) );
	
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -d.x, -hd.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -hd.x, -hd.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( hd.x, -hd.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( d.x, -hd.y ) );
	
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -d.x, hd.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -hd.x, hd.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( hd.x, hd.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( d.x, hd.y ) );
	
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -d.x, d.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( -hd.x, d.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( hd.x, d.y ) );
	shadow += compairShadowMapDepth( vShadowMapGeoDepth, shadowMapTex, vShadowMapUV + vec2( d.x, d.y ) );

	shadow /= 16.0;

	return shadow;

}

float shadowMapPCSS() {

	float geoDepth = vShadowMapGeoDepth;
	float shadowMapTexDepth = unpackRGBAToDepth( texture2D( shadowMapTex, vShadowMapUV ) );

	float shadow = shadowMapPCF( 1.0 + abs(geoDepth - shadowMapTexDepth) );

	return shadow;

}

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
	
	vec3 specular = (( D * G * F ) / ( 4.0 * dNL * dNV + 0.0001 ) * mat.specularColor )* irradiance; 

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
		mat.albedo = pow( mat.albedo, vec3( 1.0 / 2.2 ) );
		mat.opacity = color.w;

	#else

		mat.albedo = color;
		mat.opacity = 1.0;
	
	#endif

	#ifdef USE_ROUGHNESS_MAP

		mat.roughness = texture2D( roughnessMap, vUv ).y;

	#else

		mat.roughness = 0.5;
	
	#endif

	#ifdef USE_ALPHA_MAP

		mat.opacity *= texture2D( alphaMap, vUv ).x;

	#endif

	mat.metalness = 0.0;

	// output
	vec3 outColor = vec3( 0.0 );
	float outOpacity = mat.opacity;

	/*-------------------------------
		Depth
	-------------------------------*/

	#ifdef DEPTH

		if( outOpacity < 0.5 ) {

			discard;

		}

		float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
		gl_FragColor = packDepthToRGBA( fragCoordZ );
		return;
	
	#endif

	float wet = smoothstep( 0.4, 0.45, texture2D( noiseTex, vUv * 0.1 + vec2( 0.203, 0.43) ).x );
	wet = clamp( wet, 0.0, 1.0 );
	mat.albedo *= 1.0 - ( wet * 0.7 ) ;
	mat.roughness = mix( mat.roughness, smoothstep( 0.45, 0.6, texture2D( waterRoughness, vUv * 1.0 ).x ) * 0.3, wet );

	mat.diffuseColor = mix( mat.albedo, vec3( 0.0, 0.0, 0.0 ), mat.metalness );
	mat.specularColor = mix( vec3( 1.0, 1.0, 1.0 ), mat.albedo, mat.metalness );

	/*-------------------------------
		Geometry
	-------------------------------*/

	Geometry geo;
	geo.pos = vViewPos;
	geo.posWorld = vWorldPos;
	geo.viewDir = normalize( geo.pos );
	geo.viewDirWorld = normalize( geo.posWorld - cameraPosition );
	geo.normal = normalize( vNormal );

	#ifdef USE_NORMAL_MAP

		vec2 nUV = vUv;
		vec3 mapN = texture2D( normalMap, vUv ).xyz;
		mapN.xy = 1.0 - mapN.xy;
		mapN = mapN * 2.0 - 1.0;

		mapN = mix( mapN, vec3( 0.0, 0.0, 1.0 ), 0.5 + wet * 0.5 );

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

	// shadowMap
	float shadow = shadowMapPCSS();

	#if NUM_DIR_LIGHTS > 0

		Light light;

		#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

				light.direction = directionalLights[i].direction;
				light.color = directionalLights[ i ].color * texture2D( skyTex, vec2( 0.5, sin( time * 0.5 ) * 0.5 + 0.5 ) ).xyz;

				outColor += RE( geo, mat, light ) * shadow;
				
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

		outColor = outColor + mix( ref1, ref2, blend ) * EF * ( 1.0 + wet );

	#else
	
		outColor += mat.specularColor * textureCubeUV( envMap, refDir, mat.roughness ).xyz * EF;
	
	#endif

	gl_FragColor = vec4( outColor, outOpacity );

}