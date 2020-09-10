
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D backbuffer;
uniform sampler2D sceneDepthTex;
uniform vec2 resolution;
uniform float time;

uniform vec3 camPosition;
uniform mat4 camWorldMatrix;
uniform mat4 camProjectionMatrix;
uniform mat4 camProjectionInverseMatrix;
uniform float camNear;
uniform float camFar;

$constants

#define MAT_MAIN 1.0
#define MAT_REFLECT 2.0

#define U(z,w) (mix(z,w,step(w.x,z.x)))

float sphere( vec3 p ) {

	float r = 1.1;

	return length( p ) - r;
	
}

float sdBox( vec3 p, vec3 b )
{

	vec3 q = abs(p) - b;

	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  
}

vec2 D( vec3 p ) {

	vec2 mainObj = vec2( sdBox( p + vec3( 0.0, -0.7, 0.0 ), vec3( 0.5 ) ), MAT_MAIN );
	vec2 refPlane = vec2( sdBox( p, vec3( 10.0, 0.01, 10.0 ) ), MAT_REFLECT );

	return U( mainObj, refPlane );

}

vec3 N( vec3 pos ){

    float ep = 0.0001;

    return normalize( vec3(
		D( pos ).x - D( vec3( pos.x - ep, pos.y, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y - ep, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y, pos.z - ep ) ).x
	) );
	
}

vec4 material( inout vec3 rayPos, inout vec4 rayDir, vec2 distRes, vec3 normal ) {

	if( distRes.y == MAT_MAIN ) {

		return vec4( (normal * 0.5 + 0.5) * 0.8, 1.0 );

	} else if( distRes.y == MAT_REFLECT ) {

		rayPos += normal * 0.1;
		rayDir = vec4( reflect( rayDir.xyz, normal ), 1.0 );

		return vec4( 0.0 );
		
	}

	// return vec4( 1.0 );

}

vec4 trace( vec3 rayPos, vec4 rayDir ) {

	vec3 normal;
	vec2 distRes = vec2( 0.0 );

	vec4 raymarchCol = vec4( 0.0 );
	float depth = 0.0;

	for( int i = 0; i < 128; i++ ) {

		distRes = D( rayPos );
		depth += distRes.x;
		rayPos += distRes.x * rayDir.xyz;

		if( distRes.x < 0.01 ) {

			normal = N( rayPos );
			raymarchCol = material( rayPos, rayDir, distRes, normal );

			if( raymarchCol.w == 1.0 ) {

				break;
				
			}
			
		}
		
	}

	if( raymarchCol.w != 1.0 ) {

		depth = 1000.0;
		
	}

	depth = ( depth - camNear ) / ( camFar - camNear );
	depth *= 0.5;

	if( rayDir.w == 1.0 ) {

		depth += 0.5 * raymarchCol.w;

	}

	return vec4( raymarchCol.xyz, depth );

}

void main( void ) {

	vec2 uv = ( gl_FragCoord.xy / resolution ) * 2.0 - 1.0;
	vec4 ray = camWorldMatrix * camProjectionInverseMatrix * vec4( uv, 1.0, 1.0 );

	vec3 rayPos = camPosition;
	vec4 rayDir = vec4( ray.xyz, 1.0 );

	vec4 c = trace( rayPos, rayDir );

	gl_FragColor = c;

}