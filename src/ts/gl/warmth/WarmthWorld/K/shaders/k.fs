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

float sdCone( in vec3 p, in vec2 c, float h )
{
	// c is the sin/cos of the angle, h is height
	// Alternatively pass q instead of (c,h),
	// which is the point at the base in 2D
	vec2 q = h*vec2(c.x/c.y,-1.0);

	vec2 w = vec2( length(p.xz), p.y );
	vec2 a = w - q*clamp( dot(w,q)/dot(q,q), 0.0, 1.0 );
	vec2 b = w - q*vec2( clamp( w.x/q.x, 0.0, 1.0 ), 1.0 );
	float k = sign( q.y );
	float d = min(dot( a, a ),dot(b, b));
	float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );
	return sqrt(d)*sign(s);
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdSphere( vec3 p, float s )
{

	return length( p ) - s / 2.0;
  
}

float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;

	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  
}

float sdPyramid( vec3 p, float h)
{
  float m2 = h*h + 0.25;
    
  p.xz = abs(p.xz);
  p.xz = (p.z>p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
   
  float s = max(-q.x,0.0);
  float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
    
  float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
  float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
    
  float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
    
  return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));
}

vec2 ring( vec3 p ) {

	vec3 np = p;

	np += vec3( 0.6, 0.0, 0.0 );

	np *= 5.0;
	
	float d = sdPyramid( np, 1.0 );

	return vec2( d, 1.0 );

}

vec2 D( vec3 p ) {

	vec2 res = vec2( 0.0 );

	// noise sphere
	res = vec2( sdSphere( p, 0.5 + noise4D( vec4( p * 5.0, time ) ) * 0.1 ) , 0.0 );

	// ring
	res = U( res, ring( p ) );

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
		
		c = textureCube( envMap, reflect( dir, normal ) ).xyz * f * 1.5;

	} else if( mat == 1.0 ) {

		c = vec3( 1.0 );
		
	} else {

		c = vec3( clamp( dot( normal, vec3( 1.0, 1.0, 1.0 ) ), 0.0, 1.0  ) );
		c += 0.4;

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

		// if( !checkInBox( rayPos, vec3( 1.0 ) ) ) break;

		dist = D( rayPos );		
		rayPos += dist.x * rayDir;

		if( dist.x < 0.01 ) {

			vec3 n = N( rayPos, 0.0001 );
			vec3 normal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;

			c.xyz = material( dist.y, rayPos, rayDir, normal );
			
			c.w = 1.0;

		}
		
	}

	if( c.w < 1.0 ) discard;


	gl_FragColor = vec4( c.xyz, 1.0 );

}