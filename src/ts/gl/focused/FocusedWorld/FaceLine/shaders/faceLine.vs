uniform float time;

varying vec2 vUv;
varying float vAlpha;

#pragma glslify: random = require('./random.glsl' )
#pragma glslify: noise3D = require('./noise3D.glsl' )

void main( void ) {

	vec3 pos = position;

	float n = noise3D( vec3( pos * 1.0 ) + vec3( 0.0, 0.0, time * 0.8 ) ) * ( random( vec2( time ) ) * 0.3 + sin( time ) * sin( time * 1.1 ) );

	float res = (floor( n * 5.0 ) / 5.0) * 20.0 + 1.0;

	pos.xyz = floor( pos * res ) / res;

	vAlpha = n;
	vAlpha = smoothstep( 0.0, 1.0, vAlpha );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}