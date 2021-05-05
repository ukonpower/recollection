attribute float uvx;
attribute float uvy;

uniform sampler2D dataPos;
uniform float aboutOffset;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying vec3 vColor;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

	vec2 computeUV = vec2(uvx,uvy);
	
    vec2 nUV = computeUV + vec2(1.0,0.0);
    
    if(nUV.x >= 1.0){
        nUV = computeUV - vec2(1.0,0.0);
    }

    vec3 p = position;
    vec3 pos = texture2D( dataPos, computeUV).xyz;
    vec3 nPos = texture2D( dataPos, nUV).xyz;

    vec3 vec = normalize(nPos - pos);
    float rotX = atan2(vec.y,vec.z);

    p.xy *= smoothstep( 0.0, 0.4, sin( uvx * PI) );
	p.xy *= ((sin( computeUV.y * TPI ) * 0.5 + 0.5) * 0.9 + 0.1) * 0.5;
    p.yz *= rotate(rotX);

    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
	vNormal = normal;
	vUv = computeUV;
	vHighPrecisionZW = gl_Position.zw;

	vColor = hsv2rgb( vec3( 0.9 + sin( uvy * 643.5432 ) * 0.1 + aboutOffset * 0.473, 1.0, 1.0 ));

}


