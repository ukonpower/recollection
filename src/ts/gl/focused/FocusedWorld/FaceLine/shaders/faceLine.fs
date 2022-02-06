varying vec2 vUv;
varying float vAlpha;

void main( void ) {

	gl_FragColor = vec4( vec3( 1.0 ), vAlpha * 0.1);

}