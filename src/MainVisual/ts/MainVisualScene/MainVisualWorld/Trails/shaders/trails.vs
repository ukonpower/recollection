varying vec3 vViewPosition;
varying vec3 vNormal;
attribute float uvx;
attribute float uvy;

uniform sampler2D dataPos;

$constants
$rotate
$atan2

void main() {
    vec2 nUV = vec2(uvx,uvy) + vec2(1.0,0.0);
    
    if(nUV.x >= 1.0){
        nUV = vec2(uvx,uvy) - vec2(1.0,0.0);
    }

    vec3 p = position;
    vec3 pos = texture2D( dataPos, vec2(uvx,uvy)).xyz;
    vec3 nPos = texture2D( dataPos, nUV).xyz;

    vec3 vec = normalize(nPos - pos);
    float rotX = atan2(vec.y,vec.z);

    p.xy *= smoothstep( 0.0, 0.1, sin( uvx * PI) ) * (sin(uvy * 100.0) * 1.0 + 0.1);
    p.yz *= rotate(rotX);

    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
	vNormal = normal;
}


