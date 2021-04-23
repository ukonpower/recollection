varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D noiseTex;
uniform sampler2D sceneTex;
uniform sampler2D contentTex;

uniform float contentVisibility;
uniform float windowAspect;
uniform float time;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: random = require( './random.glsl' );
#pragma glslify: rotate = require('./rotate.glsl' )

void main(){

	vec2 uv = vUv;
	vec2 contentUV = uv;
	vec2 cUV = ( uv - 0.5 ) * 2.0;

	vec4 col = vec4(0.0);

	if( contentVisibility == 0.0 ) {

		col = texture2D( sceneTex, uv );
		
	} else if( contentVisibility == 1.0 ) {

		col = texture2D( contentTex, uv );

	} else {

		cUV.x *= windowAspect;

		vec2 noiseUV = vec2( atan( cUV.x, cUV.y ) * 0.1, 0.0 );
		vec4 noiseCol = texture2D( noiseTex, noiseUV );

		float v = smoothstep( 0.45, 1.0, contentVisibility );

		float fade = smoothstep( 0.3, 1.0, contentVisibility );
		float wwidth = 2.0;

		float f  = (fade * ( 1.0 + wwidth * 0.9 ) - wwidth );
		float s = smoothstep( f, f + (wwidth), length( cUV ) * 0.8 ) * TPI;
		float n = sin( s ) * ( 1.0 - fade);
		n = clamp( n, 0.0, 1.0 );
		float w = mix( smoothstep( 1.0, 0.0, s ), 1.0, 0.0 );
		vec2 nUV = uv - n * normalize( cUV );

		vec4 sceneCol = texture2D( sceneTex, nUV );
		vec4 contentCol = vec4( 0.0 );

		for( int i = 0; i < 1; i ++ ) {
			
			vec2 vig = (noiseCol.xy - 0.5) * sin(w * PI) * ( ( float(i) / 3.0 ) * 0.5 + 0.5 ) * ( 1.0 - fade);

			vec3 rsrc = texture2D( contentTex, nUV + vig * 2.0 ).xyz;
			vec3 gsrc = texture2D( contentTex, nUV + vig * 1.8 ).xyz;
			vec3 bsrc = texture2D( contentTex, nUV + vig * 1.5 ).xyz;

			float r = mix( dot( rsrc.xyz, vec3(0.29891, 0.58661, 0.11448) ), rsrc.x, smoothstep( 0.7, 1.0, v) );
			float g = mix( dot( gsrc.xyz, vec3(0.29891, 0.58661, 0.11448) ), gsrc.y, smoothstep( 0.7, 1.0, v) );
			float b = mix( dot( bsrc.xyz, vec3(0.29891, 0.58661, 0.11448) ), bsrc.z, smoothstep( 0.7, 1.0, v) );

			contentCol += vec4( r, g, b, 1.0 );

		}

		w = mix( w, 1.0, smoothstep( 0.7, 0.9, contentVisibility) );

		contentCol /= 1.0;
		col = mix( sceneCol, contentCol, w );

		// col.xyz = vec3( n );
		
	}

	
	
	gl_FragColor = vec4( col.xyz, 1.0 );

}