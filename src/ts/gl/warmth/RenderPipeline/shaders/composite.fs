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
#define N 8

vec2 lens_distortion(vec2 r, float alpha) {
    return r * (1.0 - alpha * dot(r, r));
    
}

void main(){

	vec3 c = vec3( 0.0 );

	vec2 uv = vUv;
	vec2 cuv = vUv * 2.0 - 1.0;

	float w = max(.0,length(cuv)) * 0.01;
	
    for(int i = 0; i < N; i++){
        float w = 0.1 + float(i) * 0.01;
        // c.x += dot( texture2D(sceneTex,lens_distortion( uv - 0.5, w ) + 0.5).xyz, vec3(0.299, 0.587, 0.114));
        // c.y += dot( texture2D(sceneTex,lens_distortion( uv - 0.5, w * 2.0 ) + 0.5).xyz, vec3(0.299, 0.587, 0.114));
        // c.z += dot( texture2D(sceneTex,lens_distortion( uv - 0.5, w * 3.0 ) + 0.5).xyz, vec3(0.299, 0.587, 0.114));
		
        c.x += texture2D(sceneTex,lens_distortion( uv - 0.5, w ) + 0.5).x;
        c.y += texture2D(sceneTex,lens_distortion( uv - 0.5, w * 2.0 ) + 0.5).y;
        c.z += texture2D(sceneTex,lens_distortion( uv - 0.5, w * 3.0 ) + 0.5).z;

    }
    c /= float(N);


	
	#pragma unroll_loop_start
	for ( int i = 0; i < RENDER_COUNT; i ++ ) {
		
		c += texture2D( bloomTexs[ UNROLLED_LOOP_INDEX ], vUv ).xyz * pow( 2.0, float( UNROLLED_LOOP_INDEX ) ) * (brightness);

	}
	#pragma unroll_loop_end

	c -= random( uv ) * 0.2 * c;

	c *= smoothstep( -0.6, 0.4, 1.0 - length( cuv ) );

	c.xyz *= mix( vec3( 1.0, 0.9, 0.7 ), vec3( 0.70, 1.0,1.1 ), smoothstep( 0.0, 1.7, length( cuv + vec2( 0.3, 0.0 ) ) ));

	gl_FragColor = vec4( c, 1.0 );

}