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

	np.x += rnd;
	for( int i = 0; i < 3; i++ ) {
		
			np.zy = abs(np.zy);
			np.xz *= rotate( PI * 0.5 );

			np.xz = abs(np.xz);
			np.yz *= rotate( length( p * (0.01 + sin(rnd * 633.4325) * 0.4) )  );

			np.xz = abs(np.xz) - 0.19;
			np.yx *= rotate( length( (np.x + np.y) * 0.4 + rnd ) );

			np.xy = abs(np.xy);
	}

	np = mod( np, 0.25 ) - 0.125;

	float w = 0.002 * smoothstep( 1.0, 0.0, length( p ) ) + smoothstep( 0.0, 1.0, sin( -time * 4.0 + length( p ) * 40.0 ) ) * 0.01;

	d = sdBox( np, vec3( w, 1.5, w ) + exp( - smoothstep( 0.0, 0.4, length( p ) ) * 6.0 ) );

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
        (p.x) < scale.x * 0.5 && 
        -(p.y) < scale.y * 0.5 && 
        -(p.z) < scale.z * 0.5;
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

	for( int i = 0; i < 20; i++ ) {

		if( !checkInBox( rayPos, vec3( 1.0 + 0.01 ) ) ) break;

		dist = D( rayPos );		
		rayPos += dist * rayDir;

		if( dist < 0.001 ) {

			vec3 n = N( rayPos, 0.0001 );
			vec3 normal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;

			c.xyz = vec3( clamp( dot( normal, vec3( 1.0, 1.0, 1.0 ) ), 0.0, 1.0  ) );
			c += 0.4;
			c.w = 1.0;
		}
		
	}

	if( c.w < 1.0 ) discard;


	gl_FragColor = vec4( c.xyz, 1.0 );

}