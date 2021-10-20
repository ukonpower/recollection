uniform sampler2D tex;
varying vec2 vUv;

float clip( vec2 uv ) {
	vec2 c = step( abs(uv - 0.5), vec2( 0.5 ) );
	return c.x * c.y;
}

void main( void ) {

	vec4 col = texture2D( tex, vUv );
	gl_FragColor = col;

}