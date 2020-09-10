varying vec2 vUv;

uniform sampler2D backbuffer;
uniform sampler2D raymarchTex;

void main( void ) {

	vec4 sceneCol = texture2D( backbuffer, vUv );
	vec4 raymarchCol = texture2D( raymarchTex, vec2( vUv.x, 1.0 - vUv.y ) );

	float selector = 0.0;

	if( raymarchCol.w > 0.5 ) {

		selector = 1.0;

	}

	vec3 col = mix( sceneCol.xyz, raymarchCol.xyz, selector );
	
	gl_FragColor = vec4( col, 1.0 );

}