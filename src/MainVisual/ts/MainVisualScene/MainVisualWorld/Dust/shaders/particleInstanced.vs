attribute float num;
attribute vec3 offsetPos;

uniform float time;
uniform float total;

varying vec2 vUv;
varying vec4 vColor;

uniform float dustVisibility;

$rotate
$constants

void main(void) {

    vec3 pos = position;

	pos *= 1.0 - ( sin( num * 50.0 ) * 0.5 + 0.5 ) * 0.8;

	pos.xz *= rotate( num * 10.0 );

	pos += offsetPos;

	pos.y += sin( time * 0.2 + num * TPI ) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position     = projectionMatrix * mvPosition;

    vUv     = uv;

	float alpha = smoothstep( -1.0, 1.0, sin( length( offsetPos - vec3( 0.0, 1.5, 0.0 ) ) * 0.6 - time * 2.0 ) );

    vColor = vec4( vec3( 1.0 ) * alpha, dustVisibility );

}