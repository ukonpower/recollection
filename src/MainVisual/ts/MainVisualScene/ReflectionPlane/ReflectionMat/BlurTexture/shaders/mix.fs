
#include <packing>

uniform sampler2D reflectionDepthTex;
varying vec2 vUv;

uniform sampler2D backbuffer;
uniform sampler2D raymarchTex;
uniform float camNear;
uniform float camFar;

float readDepth( sampler2D depthSampler, vec2 coord ) {
	float fragCoordZ = texture2D( depthSampler, coord ).x;
	float viewZ = perspectiveDepthToViewZ( fragCoordZ, camNear, camFar );
	return viewZToOrthographicDepth( viewZ, camNear, camFar );
}

void main( void ) {

	vec4 sceneCol = texture2D( backbuffer, vUv );
	vec4 raymarchCol = texture2D( raymarchTex, vec2( vUv.x, 1.0 - vUv.y ) );

	float reflectionDepth = readDepth( reflectionDepthTex,  );

	float selector = 0.0;

	if( raymarchCol.w > 0.5 ) {

		selector = 1.0;

		selector *= 1.0 -step( (raymarchCol.w - 0.5 ) * 2.0 - reflectionDepth, 0.0 );

	}

	vec3 col = mix( sceneCol.xyz, raymarchCol.xyz, selector );
	
	gl_FragColor = vec4( reflectionDepth );

}