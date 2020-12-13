#include <packing>

varying vec2 vUv;

uniform sampler2D raymarchTex;
uniform sampler2D sceneTex;
uniform sampler2D sceneDepthTex;
uniform float camNear;
uniform float camFar;

float readDepth( sampler2D depthSampler, vec2 coord ) {
	float fragCoordZ = unpackRGBAToDepth( texture2D( depthSampler, coord ) );
	float viewZ = perspectiveDepthToViewZ( fragCoordZ, camNear, camFar );
	return viewZToOrthographicDepth( viewZ, camNear, camFar );
}

float unpack16( vec2 value ) {
  return dot( value, vec2( 1.0, 1.0 / 255.0 ) );
}

vec3 unpackRG2RGB( vec2 value ) {

	value = ceil( value * 255.0 );

	float bLO = floor( value.x / 32.0 );
	float bHI = floor( value.y / 32.0 );

	float r = mod( value.x, 32.0 ) / 31.0;
	float g = mod( value.y, 32.0 ) / 31.0;
	float b = (bLO + bHI * 8.0) / 63.0;

	// return vec3( b, 0.0, 0.0 );
	return vec3( r, g, b );
	
}

void main( void ) {

	vec4 raymarchCol = texture2D( raymarchTex, vUv );
	vec4 sceneCol = texture2D( sceneTex, vUv );
	
	float sceneDepth = readDepth( sceneDepthTex, vUv );

	float rayDepth = unpack16( raymarchCol.zw );

	float selector = rayDepth < sceneDepth ? 1.0 : 0.0;
	
	vec3 col = mix( sceneCol.xyz, unpackRG2RGB( raymarchCol.xy ), selector );

	gl_FragColor = vec4( col, 1.0 );
	// gl_FragColor = vec4( vec3( sceneDepth ) * 10.0, 1.0 );

}