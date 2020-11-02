
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

#pragma glslify: import( './constants.glsl' )
#pragma glslify: rotate = require( './rotate.glsl' )

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

float sphereObj( vec3 p  ) {

	p.xy *= rotate(time * 0.5);
	p.xz *= rotate(time * 0.5);
	
	for (int i = 0; i < 5; i++) {
		p.zy = abs(p.zy);
		p.xy *= rotate(time * 0.23 + length( p ) * 3.5 );
		p.xz = abs(p.xz);
		p.xz *= rotate(time * 0.3 + + length( p ) * 0.5 );
	}

	return sdBox( p, vec3( 0.7 ) );

}


vec2 MainObjDist( vec3 p ) {

	float d = 0.0;

	d = sphereObj( p );

	return vec2( d, MAT_MAIN );
	
}

vec2 D( vec3 p ) {

	vec2 mainObj = MainObjDist( p );
	// vec2 refPlane = vec2( sdBox( p, vec3( 100.0, 0.01, 100.0 ) ), MAT_REFLECT );
	// return U( mainObj, refPlane );
	return mainObj;

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

		vec3 c = vec3( dot( normal, normalize(vec3( 1.0, 1.0, 1.0 )) ) * 0.2  + 0.5);

		return vec4( c, 1.0 );

	}

	return vec4( 1.0 );

}

vec2 packing16( float value ) { 

	float v1 = value * 255.0;
	float r = floor(v1);

	float v2 = ( v1 - r ) * 255.0;
	float g = floor( v2 );

	return vec2( r, g ) / 255.0;

}

vec2 packingRGB2RG( vec3 value ) {

	value = clamp( value, 0.0, 1.0 );

	float r = floor( value.x * 31.0 );
	float g = floor( value.y * 31.0 );
	float b = floor( value.z * 63.0 );

	float bLO = floor( ( mod( b, 8.0 ) ) * 32.0 );
	float bHI = floor( floor( b / 8.0 ) * 32.0 );

	return vec2( r + bLO, g + bHI ) / 255.0;
	
}

bool intersectionSphere( vec3 rayOrigin, vec3 rayDirection, vec3 pos, float radius ) {

	vec3 oc = rayOrigin - pos;
    float a = dot( rayDirection, rayDirection );
    float b = 2.0 * dot( oc, rayDirection );
    float c = dot( oc,oc ) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;
	float t = ( -b - sqrt( discriminant ) ) / ( 2.0 * a );

	if( discriminant > 0.0 && t > 0.00001 ) {

		return true;
		
	}

	return false;
	
}

vec4 trace( vec3 rayPos, vec4 rayDir ) {

	vec2 distRes = vec2( 0.0 );

	vec4 raymarchCol = vec4( 0.0 );
	float depth = 0.0;

	if( intersectionSphere( rayPos, rayDir.xyz, vec3( 0.0, 0.0, 0.0 ), 1.0 ) ) {

		for( int i = 0; i < 8; i++ ) {

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

	}

	if( raymarchCol.w != 1.0 ) {

		depth = 99999.0;
		
	}

	depth = ( depth - camNear ) / ( camFar - camNear );

	return vec4( packingRGB2RG( raymarchCol.xyz ), packing16( depth ) );

}

void main( void ) {

	vec2 uv = ( gl_FragCoord.xy / resolution ) * 2.0 - 1.0;
	vec4 ray = camWorldMatrix * camProjectionInverseMatrix * vec4( uv, 1.0, 1.0 );

	vec3 rayPos = camPosition;
	vec4 rayDir = vec4( ray.xyz, 0.0 );

	vec4 c = trace( rayPos, rayDir );

	gl_FragColor = c;

}