varying vec2 vUv;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D dofBlurTex;

void main(){

	vec3 col;
	
	vec4 scene = texture2D( sceneTex, vUv );
	vec4 dofBlur = texture2D( dofBlurTex, vUv );

	col = mix( scene.xyz, dofBlur.xyz, dofBlur.w );

	// col = dofBlur.xyz;

	gl_FragColor = vec4( col, 1.0 );

}