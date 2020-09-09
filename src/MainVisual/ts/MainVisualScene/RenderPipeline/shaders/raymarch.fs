#include <packing>

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D backbuffer;
uniform sampler2D sceneDepthTex;
uniform vec2 resolution;
uniform float time;

uniform vec3 camPosition;
uniform mat4 camWorldMatrix;
uniform mat4 camProjectionInverseMatrix;
uniform float camNear;
uniform float camFar;

#define LOOP 10

$constants

float readDepth( sampler2D depthSampler, vec2 coord ) {
	float fragCoordZ = texture2D( depthSampler, coord ).x;
	float viewZ = perspectiveDepthToViewZ( fragCoordZ, camNear, camFar );
	return viewZToOrthographicDepth( viewZ, camNear, camFar );
}

float sphere( vec3 p ) {

	float r = 1.1;

	return length( p ) - r;
	
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float D( vec3 p ) {

	return sdBox( p, vec3( 0.5 ) );

}
vec3 N( vec3 pos )
{
    float ep = 0.0001;
    return normalize( vec3(
            D( pos ) - D( vec3( pos.x - ep, pos.y, pos.z ) ),
            D( pos ) - D( vec3( pos.x, pos.y - ep, pos.z ) ),
            D( pos ) - D( vec3( pos.x, pos.y, pos.z - ep ) )
        ) );
}


void main( void ) {

	vec3 normal;
	vec4 c;

	vec2 uv = ( gl_FragCoord.xy / resolution ) * 2.0 - 1.0;
	vec4 ray = camWorldMatrix * camProjectionInverseMatrix * vec4( uv, 1.0, 1.0 );
	vec3 p = camPosition;
	vec3 dir = ray.xyz;

	float l = 0.;

	for( int i = 0; i < 64; i++ ) {

		l = D( p );
		p += l * dir;

		if( l < 0.01 ) {

			c.w = 1.0;

			normal = N( p );

			c  = vec4( normal, 1.0 );

			break;
			
		}
		
	}

	float sceneDepth = readDepth( sceneDepthTex, vUv );
	sceneDepth = camNear + sceneDepth * ( camFar - camNear );

	vec3 sceneCol = texture2D( backbuffer, vUv ).xyz;

	// vec3 res = mix( sceneCol, c.xyz, step( sceneDepth - p.z, 0.0 ) );
	vec3 res = mix( sceneCol, c.xyz, step( length( p - camPosition ) - sceneDepth, 0.0 ) );

	gl_FragColor = vec4( res, 1.0 );

	// gl_FragColor = vec4( smoothstep( 0.99, 1.0, vUv.x ) );
	
}