varying vec2 vUv;
uniform vec2 resolution;
uniform sampler2D depthTex;

uniform float cameraNear;
uniform float cameraFar;
uniform float cameraFocusLength;
uniform float cameraFocalLength;

#include <packing>

void main(){
	
	float fragCoordZ = unpackRGBAToDepth( texture2D( depthTex, vUv ) );
	float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );

	float diff = -viewZ - cameraFocusLength;

	float coc = ( diff / ( cameraFocalLength ) );
	coc = min( 1.0, max( -1.0, coc * 4.0 ) );
	coc = coc * 0.5 + 0.5;
	
	gl_FragColor = vec4( coc, 0.0, 0.0, 0.0 );

}