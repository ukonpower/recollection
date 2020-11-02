uniform sampler2D tex;
varying vec2 vUv;

float median( float r, float g, float b ) {
	
    return max( min( r, g ), min( max( r, g ), b ) );
	
}
  
void main( void ) {

	vec4 col = texture2D( tex, vUv );

    float sigDist = median(col.r, col.g, col.b) - 0.5;
    float alpha = step(0.0, sigDist);
    gl_FragColor = vec4(vec3(0.7), alpha);

	// gl_FragColor = col;

    if (gl_FragColor.a < 0.0001) discard;


}