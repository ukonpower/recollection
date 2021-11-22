uniform mat4 modelMatrixInverse;
uniform mat4 modelMatrix;
uniform float time;
uniform vec2 resolution;
uniform samplerCube globalEnvMap;
uniform sampler2D skyTex;

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;

#ifdef DEPTH

	uniform float camNear;
	uniform float camFar;
	
#endif

#include <packing>

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )
#pragma glslify: noise4D = require('./noise4D.glsl' )
#define U(z,w) (mix(z,w,step(w.x,z.x)))

/*-------------------------------
	Light
-------------------------------*/

struct Light {
	vec3 direction;
	vec3 color;
};

#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

#endif

float sdCone( vec3 p, vec2 c, float h )
{
  float q = length(p.xz);
  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
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

vec3 fold(in vec2 p, in float s)
{
    float a = PI / s - atan(p.x, p.y);
    float n = TPI / s;
    a = floor(a / n) * n;
    p *= rotate(a);

    return vec3( p, a );    
}

vec2 ring( vec3 pos ) {

	vec3 p = pos;

	p.zy *= rotate( HPI / 5.0 + ( sin( time ) ) * 0.1 );
	p.xy *= rotate( (sin( time ) * 0.5 - 0.5 ) * 0.7 );
	p.xz *= rotate( time );

	float sub = 8.0;

	vec3 f = fold( p.xz, sub );
	p.xz = f.xy;
	p += vec3( 0.0, 0.0, -0.4 - (sin( time ) * 0.5 + 0.5) * 0.07 );

	vec3 pp = p;
	pp.zy *= rotate( HPI );
	
	float d = sdSphere( pp, 0.02 + sin( f.z * 10.0 + time * 4.0) * 0.8  );

	return vec2( d, 1.0 );

}

vec2 D( vec3 p ) {

	vec2 res = vec2( 0.0 );

	// noise sphere
	res = vec2( sdSphere( p, 0.07 + noise4D( vec4( p * 14.0 + vec3( -time * 1.0, -time * 0.2, time * 0.07), time * 0.3 ) ) * 0.05 ) , 0.0 );

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

float ggx( float dNH, float roughness ) {
	
	float a2 = roughness * roughness;
	a2 = a2 * a2;
	float dNH2 = dNH * dNH;

	if( dNH2 <= 0.0 ) return 0.0;

	return a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );

}

vec3 material( float mat, vec3 pos, vec3 dir, vec3 normal ) {

	vec3 c;
	
	vec3 skyColor = texture2D( skyTex, vec2( 0.5, sin( time * 0.5 ) * 0.5 + 0.5 ) ).xyz;

	vec3 hv = normalize( -dir + normalize( vec3( 0.0, -1.0, 0.0 ) - pos.xyz ) );
	float dvh = dot( -dir, normal );
	float f = fresnel( dvh );

	c = vec3( 0.3 );
	c += textureCube( globalEnvMap, reflect( dir, normal ) ).xyz * f * 1.5 * skyColor;
	c += pow( smoothstep( 0.5, 1.0, dot( -dir, normal ) ) * 1.0, 3.0 );

	#if NUM_DIR_LIGHTS > 0

		Light light;

		#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

				light.direction = directionalLights[ i ].direction;
				light.color = directionalLights[ i ].color;

				vec3 lightDir = normalize( light.direction );
				vec3 halfVec = normalize( -dir + lightDir );

				float dNH = dot( normal, halfVec );

				c += ggx( dNH, 0.2 ) * skyColor;
				
			}
		#pragma unroll_loop_end

	#endif

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

			#ifdef DEPTH

				float depth = ( dist.x - camNear ) / ( camFar - camNear );
				gl_FragColor = packDepthToRGBA( depth );
				return;

			#else 

				vec3 n = N( rayPos, 0.0001 );
				vec3 normal = normalize(modelMatrix * vec4( n, 0.0 )).xyz;
				c.xyz = material( dist.y, rayPos, rayDir, normal );
				c.w = 1.0;
			
			#endif

			break;

		}
		
	}

	if( c.w < 1.0 ) discard;

	gl_FragColor = vec4( c.xyz, 0.8 );

}