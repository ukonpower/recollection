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

float sdSphere( vec3 p, float s )
{

	return length( p ) - s / 2.0;
  
}

float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;

	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  
}

float D( vec3 p ) {

	vec3 np = p;
	float d = 0.0;

	for (int i = 0; i < 3; i++) {

		np.zy = abs(np.zy);
		// np.xz *= rotate( floor(rnd * 100.0 ) * PI + rnd );

		// np.xz = abs(np.xz) - 0.2;
		// np.zy *= rotate( (rnd * 0.1 + length( p ) * 0.5 + time) ) ;

		// np *= 1.0 + sin( p.x * 10.0 + time ) * 0.2;

	}
	
	// np += sin( length( p ) * 20.0 + time * 4.0 ) * normalize( p ) * 0.05;
	np = mod( np, 0.3 ) - 0.15;
	// np *= sin( time );

	d = sdBox( np, vec3( .08 ) );

	return d;

}

vec3 N( vec3 pos, float delta ){

    return normalize( vec3(
		D( pos ) - D( vec3( pos.x - delta, pos.y, pos.z ) ),
		D( pos ) - D( vec3( pos.x, pos.y - delta, pos.z ) ),
		D( pos ) - D( vec3( pos.x, pos.y, pos.z - delta ) )
	) );
	
}

bool checkInBox( vec3 p, vec3 scale ) {
	return 
        abs(p.x) < scale.x * 0.5 && 
        abs(p.y) < scale.y * 0.5 && 
        abs(p.z) < scale.z * 0.5;
}


float fresnel( float dVH ) {

	float f0 = 0.01;
	return f0 + ( 1.0 - f0 ) * pow( 1.0 - dVH, 2.0 );
	
}

void main( void ) {

	vec3 wrd = normalize( vPos - cameraPosition );
	vec3 rayPos = (modelMatrixInverse * vec4(vPos, 1.0)).xyz;
	vec3 rayDir = normalize((modelMatrixInverse * vec4( wrd, 0.0)).xyz);
	float dist = 0.0;

	vec4 c = vec4( 0.0 );

	float tmin = 0.0;
	float tmax = 1e16;

	for( int i = 0; i < 32; i++ ) {

		if( !checkInBox( rayPos, vec3( 1.0 + 0.1 ) ) ) break;

		dist = D( rayPos );		
		rayPos += dist * rayDir;

		if( dist < 0.01 ) {

			vec3 n = N( rayPos, 0.0001 );
			vec3 normal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;

			// vec3 v = ( wrd );
			// float dv = dot( v, n );

			// float f = fresnel( dv );
			// float nf = (0.5 - smoothstep( 0.0, 0.03, f ) );

			// c.xyz = vec3( nf );
			
			c.xyz = vec3( clamp( dot( normal, vec3( 1.0, 1.0, 1.0 ) ), 0.0, 1.0  ) );

			// c.xyz += vec3( length( n - N( rayPos, 0.007 ) ) ) * 3.0;
			// c.xyz = textureCube( envMap, reflect( rayDir, normal ) ).xyz;
			
			c.w = 1.0;
			
		}
		
	}

	if( c.w < 1.0 ) discard;

	gl_FragColor = vec4( c.xyz, 1.0 );

}