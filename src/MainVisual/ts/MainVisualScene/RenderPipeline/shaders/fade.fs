varying vec2 vUv;

uniform float sceneSelector;
uniform sampler2D sceneTex;
uniform sampler2D subpageSceneTex;
uniform float topFilter;
uniform float time;
void main(){

	vec4 sceneCol = texture2D( sceneTex, vUv );
	sceneCol.xyz *= vec3( 1.00, 1.0, 1.0 );
	sceneCol.xyz = ( sceneCol.xyz * mix( vec3( 1.0 ), vec3( 0.7, 0.5, 0.8 ), ( topFilter * 0.5 ) ) ) + vec3( 0.03, 0.0, 0.1 ) * topFilter;
	
	float bWave = ( sin( vUv.y * 550.0 - time * 10.0 ) + 1.0 ) * 0.02 * topFilter;
	sceneCol.xyz -= bWave;

	vec4 subpageCol = texture2D( subpageSceneTex, vUv );

	vec4 c = mix( sceneCol, subpageCol, subpageCol.w );

	gl_FragColor = vec4( c.xyz, 1.0 );
	
}