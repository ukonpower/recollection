#include <packing>

varying vec2 vUv;

uniform sampler2D backbuffer;
uniform sampler2D raymarchTex;
uniform sampler2D sceneTex;
uniform sampler2D sceneDepthTex;
uniform float camNear;
uniform float camFar;

float readDepth( sampler2D depthSampler, vec2 coord ) {
	float fragCoordZ = texture2D( depthSampler, coord ).x;
	float viewZ = perspectiveDepthToViewZ( fragCoordZ, camNear, camFar );
	return viewZToOrthographicDepth( viewZ, camNear, camFar );
}

void main( void ) {

	vec4 raymarchCol = texture2D( raymarchTex, vUv );
	vec3 sceneCol = texture2D( backbuffer, vUv ).xyz;
	
	float sceneDepth = readDepth( sceneDepthTex, vUv );
	// sceneDepth = camNear + sceneDepth * ( camFar - camNear );

	float rayDepth = raymarchCol.w;

	if( rayDepth > 0.5 ) {

		rayDepth -= 0.5;
		
	}

	rayDepth *= 2.0;

	float selector = step( rayDepth - sceneDepth, 0.0 );
	selector = clamp( selector, 0.0, 1.0 );
	
	vec3 col = mix( sceneCol, raymarchCol.xyz, selector );

	gl_FragColor = vec4( col, 1.0 );

}