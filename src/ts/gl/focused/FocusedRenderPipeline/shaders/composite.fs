varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D lensTex;
uniform sampler2D bloomTexs[RENDER_COUNT];
uniform sampler2D noiseTex;
uniform float brightness;
uniform float time;

#pragma glslify: random = require( './random.glsl' );
#define N 3

vec2 lens_distortion(vec2 r, float alpha) {
    return r * (1.0 - alpha * dot(r, r));
    
}

vec3 aces(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}


void main(){

	vec3 c = vec3( 0.0 );

	vec2 uv = vUv;
	vec2 cuv = vUv * 2.0 - 1.0;

    // for(int i = 0; i < N; i++){
    //     float w = 0.15 + float(i) * 0.01;
    //     c.x += texture2D(sceneTex,lens_distortion( uv - 0.5, w + 0.00 ) + 0.5).x;
    //     c.y += texture2D(sceneTex,lens_distortion( uv - 0.5, w + 0.05 ) + 0.5).y;
    //     c.z += texture2D(sceneTex,lens_distortion( uv - 0.5, w + 0.10 ) + 0.5).z;
    // }
    // c /= float(N);
	
	c = texture2D(sceneTex, uv ).xyz;

	#pragma unroll_loop_start
	for ( int i = 0; i < RENDER_COUNT; i ++ ) {
		
		// c += texture2D( bloomTexs[ UNROLLED_LOOP_INDEX ], vUv ).xyz * pow( 2.0, float( UNROLLED_LOOP_INDEX ) ) * (brightness * 0.8);

	}
	#pragma unroll_loop_end

	// c -= random( uv ) * 0.03 * c;
	// c *= smoothstep( -0.8, 1.0, 1.0 - length( cuv ) );

	gl_FragColor = vec4( c, 1.0 );

}