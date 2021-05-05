varying vec3 vViewPosition;
varying vec4 vColor;

attribute float uvx;
attribute float uvy;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float camY;

float PI = 3.14159265;

float atan2(float y, float x)
{
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

mat2 rotate(float rad){
    return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
}

void main() {
    vec2 nUV = vec2(uvx,uvy) + vec2(1.0,0.0);
    
    if(nUV.x >= 1.0){
        nUV = vec2(uvx,uvy) - vec2(1.0,0.0);
    }

    vec3 p = position * 0.3;
    vec4 posData = texture2D( texturePosition, vec2(uvx,uvy));
    vec3 pos = posData.xyz;
    vec3 nPos = texture2D( texturePosition, nUV).xyz;

    vec4 velData = texture2D( textureVelocity, vec2(0.0,uvy));
    float r  = (1.0 - ( posData.w / velData.w )) * 1.0;

    vec3 vec = normalize(nPos - pos);
    float rotX = atan2(vec.y,vec.z);

    // p.xy *= sin(uvx * PI) * (sin(uvy * PI) * 1.0 + 0.1);
    p.xy *= r;
    p.yz *= rotate(rotX);

    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;

    vColor = vec4( abs(vec), 1.0 );
}


