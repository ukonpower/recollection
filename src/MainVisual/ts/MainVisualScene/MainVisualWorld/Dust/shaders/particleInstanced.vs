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

	pos.xz *= rotate( num * 10.0 );

	pos += offsetPos;

	pos.y += sin( time * 0.2 + num * TPI ) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position     = projectionMatrix * mvPosition;

    vUv     = uv;

	float alpha = smoothstep( -1.0, 1.0, sin( length( offsetPos ) * 0.4 - time * 7.0 ) );

    vColor = vec4( vec3( 1.0 ) * alpha, dustVisibility );

}