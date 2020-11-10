uniform sampler2D tex;
uniform float left;
uniform float top;
uniform float width;
uniform float height;
varying vec2 vUv;

float median( float r, float g, float b ) {
	
    return max( min( r, g ), min( max( r, g ), b ) );
	
}
  
void main( void ) {

	vec4 fontTex = texture2D( tex, vUv );
    float sigDist = median( fontTex.r, fontTex.g, fontTex.b ) - 0.5;
    float alpha = step( 0.0, sigDist );
	alpha *= step( vUv.y, 1.0 - top );
	alpha *= step( 1.0 - top - height, vUv.y );
	alpha *= step( left, vUv.x  );
	alpha *= step( vUv.x, left + width );
	
	// vec3 col = vec3( smoothstep( -1.0, 1.5, 1.0 - (vUv.x - left) / width ) );
	vec3 col = vec3( smoothstep( 2.5, -0.8, ( (1.0 - vUv.y) - top) / height ) );

	
    gl_FragColor = vec4( col, alpha );

}