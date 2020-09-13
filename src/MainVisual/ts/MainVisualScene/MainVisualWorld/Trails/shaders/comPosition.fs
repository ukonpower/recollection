uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;

void main() {
    if(gl_FragCoord.x <= 1.0){
        vec2 uv = gl_FragCoord.xy / dataSize.xy;
        vec3 pos = texture2D( dataPos, uv ).xyz;
        vec3 vel = texture2D( dataVel, uv ).xyz;

        pos += vel * 0.01;
        gl_FragColor = vec4(pos,1.0);
        
    }else{
        vec2 uv = gl_FragCoord.xy / dataSize.xy;
        vec2 bUV = (gl_FragCoord.xy - vec2(1.0,0.0)) / dataSize.xy;
        vec3 bPos = texture2D( dataPos, bUV ).xyz;;
        gl_FragColor = vec4(bPos,1.0);
    }
}