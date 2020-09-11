varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D lensTex;
uniform sampler2D blurTex[RENDER_COUNT];
uniform float brightness;
uniform float time;
uniform float movieVisibility;

$random

void main(){

	vec3 c = vec3( 0.0 );

	vec2 uv = vUv;
	vec2 u = vUv * 2.0 - 1.0;
    float w = max( .0 ,length(u) ) * 0.02;
    vec2 vig = u * w * 0.8;
	
	uv -= u* 0.03;
	
	for( float i = 1.0;  i <= 5.0; i += 1.0 ) {
        vig *= 1.0 + i * 0.03;
        c.x += texture2D(sceneTex, uv + vig * 1.0  ).x;
        c.y += texture2D(sceneTex, uv + vig * 1.3  ).y;
        c.z += texture2D(sceneTex, uv + vig * 1.5  ).z;

	}

	c /= 5.0;
	c *= 1.0 - smoothstep( 0.5, 1.0, length( u ) ) * 0.2;
	c += ( random( vUv + sin( time ) ) * 2.0 - 1.0 ) * 0.02;

	vec2 vigUV = uv + vig * 1.1;

	c += texture2D(blurTex[ 0 ], vigUV ).xyz * 1.0 * brightness;
	c += texture2D(blurTex[ 1 ], vigUV ).xyz * 2.0 * brightness;
	c += texture2D(blurTex[ 2 ], vigUV ).xyz * 4.0 * brightness;
	c += texture2D(blurTex[ 3 ], vigUV ).xyz * 6.0 * brightness;

	vec3 blur = texture2D(blurTex[ 4 ], vigUV ).xyz * 8.0 * brightness;
	c += blur;

	c *= smoothstep( 1.5, 0.6, length( u ) );

	c += texture2D( lensTex, vUv ).xyz * blur * 1.2;

	c *= movieVisibility;

	gl_FragColor = vec4( c, 1.0 );

}