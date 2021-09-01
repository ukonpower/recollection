uniform mat4 modelMatrixInverse;
uniform mat4 modelMatrix;
uniform vec3 scale;
uniform float time;
uniform float rnd;
uniform samplerCube envMap;

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

#pragma glslify: noise4D = require('./noise4D.glsl' )

#define U(z,w) (mix(z,w,step(w.x,z.x)))

float sdCone( vec3 p, vec2 c, float h )
{
  float q = length(p.xz);
  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
}

vec2 o( vec3 pos ) {

	vec3 p = pos;

	p.xy *= rotate( PI );

	for( float i = 0.0; i < 2.0; i++ ) {

		p.x = abs( p.x ) - 0.001;		
		p.xy *= rotate( 0.05 );

		p.xz *= rotate( time + p.y * 2.0 );
		
	}

	float d = sdCone( p, vec2( 1.0, 0.02 ), 3.0 );

	return vec2( d, 0.0 );

}

vec2 D( vec3 p ) {

	vec2 res = vec2( 0.0 );

	res = o( p );

	return res;

}

vec3 N( vec3 pos, float delta ){

    return normalize( vec3(
		D( pos ).x - D( vec3( pos.x - delta, pos.y, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y - delta, pos.z ) ).x,
		D( pos ).x - D( vec3( pos.x, pos.y, pos.z - delta ) ).x
	) );
	
}

bool checkInBox( vec3 p, vec3 scale ) {
	return 
        (p.x) < scale.x * 0.5 && 
        -(p.y) < scale.y * 0.5 && 
        -(p.z) < scale.z * 0.5;
}


float fresnel( float dVH ) {

	float f0 = 0.01;
	return f0 + ( 1.0 - f0 ) * pow( 1.0 - dVH, 2.0 );
	
}

vec3 material( float mat, vec3 pos, vec3 dir, vec3 normal ) {

	vec3 c;

	if( mat == 0.0 ) {
		
		vec3 hv = normalize( -dir + normalize( vec3( 0.0, -1.0, 0.0 ) - pos.xyz ) );
		float dvh = dot( -dir, normal );

		float f = fresnel( dvh );
		
		// c = mix( vec3( 1.0 ), vec3( 0.7, 0.9, 1.0 ), smoothstep( 0.0, 0.6, f ) );
		c = mix( vec3( 1.0 ), vec3( 1.0, 0.6, 0.7 ), smoothstep( 0.0, 0.5, f ) );
		// c += textureCube( envMap, reflect( dir, normal ) ).xyz * f * 1.5;

	}

	return c;
	
}

void main( void ) {

	vec3 wrd = normalize( vPos - cameraPosition );
	vec3 rayPos = (modelMatrixInverse * vec4(vPos, 1.0)).xyz;
	vec3 rayDir = normalize((modelMatrixInverse * vec4( wrd, 0.0)).xyz);
	vec2 dist = vec2(0.0);

	vec4 c = vec4( 0.0 );

	for( int i = 0; i < 32; i++ ) {

		dist = D( rayPos );		
		rayPos += dist.x * rayDir;

		if( dist.x < 0.0001 ) {

			vec3 n = N( rayPos, 0.0001 );
			vec3 normal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;

			c.xyz = material( dist.y, rayPos, rayDir, normal );
			
			c.w = 1.0;

		}
		
	}

	if( c.w < 1.0 ) discard;

	gl_FragColor = c;

}