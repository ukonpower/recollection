#define STANDARD
#ifdef PHYSICAL
	#define REFLECTIVITY
	#define CLEARCOAT
	#define TRANSPARENCY
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
float metalness = 0.0;
uniform float opacity;
uniform sampler2D roughnessTex;
uniform sampler2D normalTex;
uniform sampler2D reflectionTex;
uniform vec2 canvasResolution;
uniform sampler2D colorTex;
varying vec4 mvpPos;
varying vec4 refUV;

varying vec2 vUv;
#ifdef TRANSPARENCY
	uniform float transparency;
#endif
#ifdef REFLECTIVITY
	uniform float reflectivity;
#endif
#ifdef CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheen;
#endif
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

#pragma glslify: rotate = require('./rotate.glsl' )

uniform float time;

float fresnel( float f0, float HV ) {

	return f0 + ( 1.0 - f0 ) * pow( 1.0 - HV, 5.0 );
	
}

void main() {
	#include <clipping_planes_fragment>

	vec2 texUV = vUv * 8.0;
	
	vec4 diffuseColor = vec4( vec3( 0.3 ), 1.0 );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>

	vec4 texelColor = texture2D( map, vUv );
	// texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;

	#include <color_fragment>

	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	float roughnessFactor = roughness;
	roughnessFactor *= texelRoughness.g;

	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	vec3 ref = texture2DProj( reflectionTex, refUV ).xyz;

	float f = dot( normalize( vViewPosition ), normal );
	f = fresnel( 0.1, f );
	f = (smoothstep( 0.3, 1.0, f) ) * .5;
	
	outgoingLight = mix( outgoingLight, ref, ( f ) );

	#ifdef TRANSPARENCY
		diffuseColor.a *= saturate( 1. - transparency + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) );
	#endif

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

}