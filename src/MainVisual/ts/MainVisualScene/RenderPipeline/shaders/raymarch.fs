
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

uniform float phase;

$constants

#define MAT_MAIN 1.0
#define MAT_REFLECT 2.0

#define U(z,w) (mix(z,w,step(w.x,z.x)))

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{

	vec3 q = abs(p) - b;

	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  
}

$rotate

float phase1( vec3 p ) {

	return sdSphere( p, 0.5 );
	
}

float phase2( vec3 p ) {

	float t = time * 0.3;

	float move = cos( t );

	for( int i = 0; i < 5; i ++ ) {

		p.xz *= rotate( t );

		p.x -= 0.2 * move;
		
		p.xz *= rotate( t );

		for( int i = 0; i < 5; i ++ ) {
			
			p.xy *= rotate( t );

		}

		p.x = abs( p.x );

		// p *= 1.1;
		p.yz *= rotate( 0.5 );
		
	}

	return sdSphere( p, 0.5 - move * 0.2 );
}

float phase3( vec3 p  ) {

	float t = time * 0.3;

	float move = cos( t );

	for( int i = 0; i < 5; i ++ ) {

		p.xz *= rotate( t );

		p.x -= 0.2 * move;
		
		p.xz *= rotate( t );
		p.xz *= rotate( t );

		for( int i = 0; i < 5; i ++ ) {
			
			p *= 1.01;
			p.xy *= rotate( t );

		}

		p = abs( p );

		p.yz *= rotate( 0.5 );
		
	}

	return sdSphere( p, 0.5 - move * 0.1 );

}

float phase4( vec3 p  ) {

	p.xy *= rotate(time * 0.5);
	p.xz *= rotate(time * 0.5);

	if( sdBox( p, vec3( 0.6 ) ) < 0.5 ) {
		
		for (int i = 0; i < 7; i++) {
			p.zy = abs(p.zy);
			p.xy *= rotate(time * 0.23 + length( p ) * 3.5 );
			p.xz = abs(p.xz);
			p.xz *= rotate(time * 0.3 + + length( p ) * 0.5 );
		}

	}

	return sdBox( p, vec3( 0.6 ) );

}


vec2 MainObjDist( vec3 p ) {

	float d = 0.;

	p.y -= 1.2;

	if( false ) {

		d = phase2( p );

	} else {

		if( phase <= 1.0 ) {

			d = phase1( p );
			
		} else if( phase <= 2.0 ) {

			d = mix( phase1( p ), phase2( p ), phase - 1.0 );

		} else if( phase <= 3.0 ) {

			d = mix( phase2( p ), phase3( p ), phase - 2.0 );

		} else if( phase <= 4.0 ) {

			d = mix( phase3( p ), phase4( p ), phase - 3.0 );

		} else if( phase <= 5.0 ) {

			d = mix( phase4( p ), phase1( p ), phase - 4.0 );

		}

	}

	return vec2( d, MAT_MAIN );
	
}

vec2 D( vec3 p ) {

	vec2 mainObj = MainObjDist( p );
	vec2 refPlane = vec2( sdBox( p, vec3( 100.0, 0.01, 100.0 ) ), MAT_REFLECT );

	return U( mainObj, refPlane );

}

vec3 N( vec3 pos, float delta ){

    return normalize( vec3(
		D( pos ).x - D( vec3( pos.x - delta, pos.y, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y - delta, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y, pos.z - delta ) ).x
	) );
	
}

vec3 matEdge( vec3 normal, vec3 normal2 ) {

    float diff = clamp( dot( vec3( 0.5, 0.5, 0.5 ), normal ), 0.1, 1.0 );

    vec3 edge = vec3( length( normal - normal2 ) ) * 3.0;

	return vec3( edge );
	
}

vec3 matMain( vec3 normal ) {

	float w = clamp(dot(vec3(0.0,1.0,0.0), normal), 0.1, 1.0);
	w += clamp(dot(vec3(0.0,-1.0,0.0), normal), 0.1, 1.0);

	return vec3( w * 0.15  + 0.55 );
	
}

vec4 material( inout vec3 rayPos, inout vec4 rayDir, vec2 distRes ) {

	vec3 normal = N( rayPos, 0.0001 );
	
	if( distRes.y == MAT_MAIN ) {

		vec3 normal2 = N( rayPos, 0.01 );

		vec3 c = mix( matMain( normal ), matEdge( normal, normal2 ), clamp( phase - 2.0, 0.0, 1.0 ) );
		// vec3 c = mix( matMain( normal ), matEdge( normal, normal2 ), 1.0 );

		return vec4( c, 1.0 );

	} else if( distRes.y == MAT_REFLECT ) {

		rayPos += normal * 0.1;
		rayDir = vec4( reflect( rayDir.xyz, normal ), 1.0 );

		return vec4( 0.0 );
		
	}

	return vec4( 1.0 );

}

vec4 trace( vec3 rayPos, vec4 rayDir ) {

	vec2 distRes = vec2( 0.0 );

	vec4 raymarchCol = vec4( 0.0 );
	float depth = 0.0;

	for( int i = 0; i < 32; i++ ) {

		distRes = D( rayPos );
		depth += distRes.x;
		rayPos += distRes.x * rayDir.xyz;

		if( distRes.x < 0.01 ) {

			raymarchCol = material( rayPos, rayDir, distRes );

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

	// return vec4( vec3( rayDir.w ), depth );
	return vec4( raymarchCol.xyz, depth );

}

void main( void ) {

	vec2 uv = ( gl_FragCoord.xy / resolution ) * 2.0 - 1.0;
	vec4 ray = camWorldMatrix * camProjectionInverseMatrix * vec4( uv, 1.0, 1.0 );

	vec3 rayPos = camPosition;
	vec4 rayDir = vec4( ray.xyz, 0.0 );

	vec4 c = trace( rayPos, rayDir );

	gl_FragColor = c;

}