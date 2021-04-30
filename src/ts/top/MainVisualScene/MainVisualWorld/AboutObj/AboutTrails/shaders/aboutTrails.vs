attribute float uvx;
attribute float uvy;

uniform sampler2D dataPos;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vHighPrecisionZW;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

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

    // p.xy *= smoothstep( 0.0, 0.4, sin( uvx * PI) ) * (sin(uvy * 100.0) * 1.0 + 0.1);
	p.xy *= ((sin( computeUV.y * TPI ) * 0.5 + 0.5) * 0.9 + 0.1) * 0.5;
    p.yz *= rotate(rotX);

    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
	vNormal = normal;
	vUv = computeUV;
	vHighPrecisionZW = gl_Position.zw;
}


