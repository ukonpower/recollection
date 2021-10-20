uniform sampler2D tex;
varying vec2 vUv;

float clip( vec2 uv ) {
	vec2 c = step( abs(uv - 0.5), vec2( 0.5 ) );
	return c.x * c.y;
}

void main( void ) {

	// vec2 baseUV = vUv;
	// baseUV.x *= 1.5;

	// vec2 uv;
	// uv = baseUV;
	// vec4 col = vec4( 0.0 );
	// col += texture2D( tex, uv ) * clip( uv );

	// baseUV *= 2.0;
	// uv = baseUV + vec2( -2.0, -1.0 );
	// col += texture2D( tex, uv ) * clip( uv );
	
	// baseUV *= 2.0;
	// uv = baseUV + vec2( -4.0, -1.0 );
	// col += texture2D( tex, uv ) * clip( uv );

	// baseUV *= 2.0;
	// uv = baseUV + vec2( -8.0, -1.0 );
	// col += texture2D( tex, uv ) * clip( uv );
	
	// baseUV *= 2.0;
	// uv = baseUV + vec2( -16.0, -1.0 );
	// col += texture2D( tex, uv ) * clip( uv );
	
	// baseUV *= 2.0;
	// uv = baseUV + vec2( -32.0, -1.0 );
	// col += texture2D( tex, uv ) * clip( uv );
	
	// baseUV *= 2.0;
	// uv = baseUV + vec2( -64.0, -1.0 );
	// col += texture2D( tex, uv ) * clip( uv );

	vec4 col = texture2D( tex, vUv );
	col.xy = vUv;

	gl_FragColor = col;

}