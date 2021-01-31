varying vec2 currentUV;
varying vec2 nextUV;
varying vec2 vHighPrecisionZW;
varying vec2 vUv;

uniform vec3 camPosition;
uniform float contentNum;
uniform float contentFade;

uniform float windowAspect;
uniform float infoVisibility;

uniform float loaded1;
uniform float loaded2;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;

	pos.xz = vec2( -4.0, 0.0 );
	pos.xz *= rotate( -uv.x * PI );	
	pos.z *= loaded2;
	pos.y *= 4.5;

	pos.y *= infoVisibility * (0.005 + ( loaded2 ) * 0.995);
	
	pos.y -= (uv.x - 0.5) * 2.0 * loaded1;
	pos.z *= 0.5;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vHighPrecisionZW = gl_Position.zw;

	vec3 wPos = gl_Position.xyz;

	currentUV = ((gl_Position.xy / gl_Position.w) + 1.0) / 2.0;
	currentUV -= 0.5;
	currentUV *= 0.8;

	currentUV.x *= windowAspect;
	currentUV.x /= 16.0 / 9.0;
	
	currentUV += 0.5;

	float m = 0.7;
	nextUV = currentUV;	
	nextUV.x += ( -1.0 + contentFade ) * m;
	nextUV.y -= ( -1.0 + contentFade ) * ( m * 0.3);

	currentUV.x += contentFade * m;
	currentUV.y -= contentFade * ( m * 0.3);

	vec3 v = wPos - camPosition * 10.0;
	currentUV += v.xy * 0.01;
	nextUV += v.xy * 0.01;
	vUv = uv;

}