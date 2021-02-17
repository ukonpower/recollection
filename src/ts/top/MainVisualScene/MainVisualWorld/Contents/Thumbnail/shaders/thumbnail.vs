varying vec2 currentUV;
varying vec2 nextUV;
varying vec2 vHighPrecisionZW;
varying vec2 vUv;

uniform vec3 camPosition;
uniform float contentNum;
uniform float contentFade;

uniform float windowAspect;
uniform float portraitWeight;
uniform float infoVisibility;

uniform float loaded1;
uniform float loaded2;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

float easeOutQuart( float t ) {

	return 1.0 - pow(1.0 - t, 4.0);

}

float easeInOutQuart( float t ) {

	return t < 0.5 ? 8.0 * t * t * t * t : 1.0 -8.0 * ( --t ) * t * t * t;

}

void main( void ) {

	vec3 pos = position;
	float portraitWeightInv = 1.0 - portraitWeight;

	pos.xz = vec2( -4.0 * (1.0 - portraitWeight * 0.6), 0.0 );
	pos.xz *= rotate( -uv.x * PI );	
	pos.z *= loaded2 * ( portraitWeightInv );
	pos.y *= 4.5;

	float cx = abs( uv.x - 0.5 );
	float thumbVis = smoothstep( 1.0, 1.8, ( 1.0 - cx * cx ) + (loaded2) );
	// thumbVis = easeOutQuart( thumbVis );

	pos.y *= (infoVisibility ) * (0.003 + ( thumbVis ) * 0.997) * ( 1.0 - portraitWeight * 0.2 );
	
	// pos.y += portraitWeight * 0.3 * loaded2;
	float rotR = 0.2 + ( portraitWeightInv * 0.3 );
	float rotW = min( 1.0, max( 0.0, -abs(uv.x - 0.5 ) * rotR + loaded1 * ( 1.0 + rotR ) ) );
	
	pos.xy *= rotate( 0.15 * easeInOutQuart(rotW) * ( 1.0 + portraitWeight )) ;
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
	currentUV += v.xy * 0.02;
	nextUV += v.xy * 0.02;
	vUv = uv;

}