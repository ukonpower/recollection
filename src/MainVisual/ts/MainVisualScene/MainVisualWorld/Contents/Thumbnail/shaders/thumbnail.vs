varying vec2 currentUV;
varying vec2 nextUV;
varying vec2 vHighPrecisionZW;
uniform vec3 camPosition;
uniform float contentNum;
uniform float contentFade;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;

	pos.xz = vec2( -4.0, 0.0 );
	pos.xz *= rotate( -uv.x * PI );	
	pos.y *= 4.5;
	pos.y -= (uv.x - 0.5) * 2.0;
	pos.z *= 0.5;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vHighPrecisionZW = gl_Position.zw;

	vec3 wPos = gl_Position.xyz;
	vec3 v = wPos - camPosition * 10.0;

	currentUV = ((gl_Position.xy / gl_Position.w) + 1.0) / 2.0;
	currentUV -= 0.5;
	currentUV *= 0.5;
	currentUV += 0.5;

	float m = 0.4;
	nextUV = currentUV;	
	nextUV.x += ( -1.0 + contentFade ) * m;
	nextUV.y -= ( -1.0 + contentFade ) * ( m * 0.3);

	currentUV.x += contentFade * m;
	currentUV.y -= contentFade * ( m * 0.3);

	currentUV += v.xy * 0.02;
	nextUV += v.xy * 0.02;

}