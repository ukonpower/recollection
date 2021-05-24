
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D backbuffer;
uniform sampler2D sceneTex;
uniform samplerCube envMap;
uniform vec2 resolution;
uniform float time;
uniform float aboutVisibility;
uniform float aboutRaymarch;
uniform float aboutOffset;

uniform float contentNum;

uniform vec3 camPosition;
uniform mat4 camWorldMatrix;
uniform mat4 camProjectionMatrix;
uniform mat4 camProjectionInverseMatrix;
uniform float camNear;
uniform float camFar;

uniform float contentVisibility;

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


vec2 mainObjDist( vec3 p ) {

	float d = 0.0;
	vec3 size = vec3(
		0.65
	);

	p += vec3( 0.0, 0.0, 1.5 );
	p += vec3(
		sin( vUv.y * 40.0 + time ) * 0.4,
		cos( p.x * 4.0 + time ) * 0.5,
		0.0
	) * 0.3 * aboutRaymarch;
	p.xz *= rotate( smoothstep( 0.8, 1.3, length( p ) ) * 4.0 * aboutRaymarch + (aboutOffset * PI * 1.5) );

	p *= 0.7;
	
	p.xz *= rotate(contentNum * 1.5);
	vec3 mp = p;

	p.xy *= rotate(time * 0.2);
	p.xz *= rotate(time * 0.2);

	if( sdBox( p, size + 0.1 ) < 0.1 ) {
	
		for (int i = 0; i < 2; i++) {

			p.zy = abs(p.zy);
			p.xz *= rotate( -contentNum * 0.3 + contentVisibility * 10.0 );

			p.xz = abs(p.xz);
			p.yz *= rotate( -contentNum * 0.9 + length( p ) * sin( contentNum ) * 2.0  );

			p.xz = abs(p.xz) - 0.2 * contentVisibility;
			p.yx *= rotate( length( (mp.x + mp.y) * 30.0 * contentVisibility ) );

			p.xy = abs(p.xy);
			p.xy *= rotate( p.x * sin( contentNum ));

		}

	}

	d = sdBox( p, size * vec3( smoothstep( 0.2, 0.0, contentVisibility), smoothstep( 0.3, 0.0, contentVisibility), smoothstep( 0.6, 0.0, contentVisibility) ) );

	return vec2( d, MAT_MAIN );
	
}

vec2 backObjDist( vec3 p ) {

	float d = 0.0;

	float lenXY = length( p.xy );
	p.xy *= rotate( -p.z  * 0.2 );
	
	float loop = contentVisibility * (2.0 - smoothstep( 5.0, 0.0, lenXY ) * 1.0 ) + 0.5;
	vec3 modP = p;
	modP = mod( modP, loop ) - loop / 2.0;
	p += vec3( 0.0, 0.0, 5.0 );

	for (int i = 0; i < 3; i++) {

		modP.zy = abs(modP.zy);
		modP.zy *= rotate( -contentVisibility * p.z * 0.2 * smoothstep( 0.2, 2.0, lenXY ) );

	}

	vec3 size = vec3( 0.001 * lenXY, 0.001 * lenXY, 10.0 * contentVisibility );

	d = sdBox( modP, size );
	d = max( d, sdSphere( p  -vec3( 0.0, 0.0, 10.0 ), ( 30.0 * contentVisibility ) )  );

	return vec2( d, MAT_MAIN );
	
}

vec2 D( vec3 p ) {

	vec2 d = mainObjDist( p );

	if( contentVisibility > 0.0 ) {
		vec2 backObj = backObjDist( p );
		d = mix( d, U( d, backObj ), smoothstep( 0.0, 0.1, contentVisibility ));
	}

	return d;

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


float GGX(vec3 normal, vec3 halfDir, float roughness) {
    float roughness2 = roughness * roughness;
    float dotNH = clamp(dot(normal, halfDir), 0.0, 1.0);
    float a = (1.0 - (1.0 - roughness2) * dotNH * dotNH);
    return roughness2 * (1.0 / PI) / (a * a);
}

float fresnel( float dVH ) {

	float f0 = 0.01;
	return f0 + ( 1.0 - f0 ) * pow( 1.0 - dVH, 2.0 );
	
}

vec4 material( inout vec3 rayPos, inout vec4 rayDir, vec2 distRes, float depth ) {

	vec3 normal = N( rayPos, 0.0001 );
	
	if( distRes.y == MAT_MAIN ) {

		vec3 v = normalize( camPosition - rayPos.xyz );
		vec3 hv = normalize( v + normalize( vec3( 0.0, -1.0, 0.0 ) - rayPos.xyz ) );
		float dvh = dot( v, normal );

		float f = fresnel( dvh );
		float nf = (0.5 - smoothstep( 0.0, 0.03, f) * 1.0 );

		vec3 c = vec3( GGX( normal, hv, 0.4 ) * 0.3 );
		c += textureCube( envMap, reflect( rayDir.xyz, normal ) ).xyz * f * 1.5;

		c.x += nf * texture2D( sceneTex, vUv + normal.xy * 0.1 ).x;
		c.y += nf * texture2D( sceneTex, vUv + normal.xy * 0.11 ).y;
		c.z += nf * texture2D( sceneTex, vUv + normal.xy * 0.12 ).z;

		c += smoothstep( -0.5, 0.5, ( 1.0 - abs( depth - ( 20.0 * contentVisibility ) ) ) );

		if( aboutRaymarch > 0.0 ) {

			c += smoothstep( 0.75, 1.0 + ( 1.0 - aboutRaymarch) * 0.1, dot( normalize( -rayPos ), normal  ) ) * vec3( 1.0, 0.1, 0.0 ) * aboutRaymarch;

		}

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

vec4 trace( vec3 rayPos, vec4 rayDir ) {

	vec2 distRes = vec2( 0.0 );
	vec4 raymarchCol = vec4( 0.0 );
	float depth = 0.0;

	for( int i = 0; i < 32; i++ ) {

		distRes = D( rayPos );
		depth += distRes.x;
		rayPos += distRes.x * rayDir.xyz;

		if( distRes.x < 0.01 ) {

			raymarchCol = material( rayPos, rayDir, distRes, depth );

			if( raymarchCol.w == 1.0 ) {

				break;
				
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