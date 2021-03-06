uniform float time;
uniform float seed;

uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: snoise = require('./noise4D.glsl' )

void main() {
    if(gl_FragCoord.x >= 1.0) return;    
    
    vec2 uv = gl_FragCoord.xy / dataSize.xy;
    vec3 pos = texture2D( dataPos, uv ).xyz;
    vec3 vel = texture2D( dataVel, uv ).xyz;
    float idParticle = uv.y * dataSize.x + uv.x;
    float scale = (sin( time * 3.0 ) * 0.5 + 0.5) * 0.2 + 0.1;
    
    vel.xyz += vec3(
      snoise( vec4( scale * pos.xyz, 7.225 * seed * 200.0 + time + 0.01 )  ),
      snoise( vec4( scale * pos.xyz, 3.553 * seed + time + 0.01 )  ),
      snoise( vec4( scale * pos.xyz, 1.259 * seed * 10.0 + time + 0.01 )  )
    ) * 0.5;

	//gravity
    vec3 gpos = pos - vec3(0.0,0.0,-1.5);
    vel += -(gpos) * length(gpos) * 0.05 * ((sin( uv.y * 25.35234 ) * 0.5 + 0.5 ) * 0.5 + 0.5);

	//raymarchObje	
	vec3 opos = pos - vec3( 0.0, 0.0, 0.0 );
	vel += smoothstep( 1.9, 1.5, length( opos ) ) * ( opos );

	vel.x += cos( atan2( pos.x, pos.z ) + 0.4) * 0.3 * length( pos.xz );
	vel.z -= sin( atan2( pos.x, pos.z ) + 0.4) * 0.3 * length( pos.xz );

    vel.xyz *= 0.95 - uv.y * 0.02;
	
    gl_FragColor = vec4( vel.xyz, 1.0 );
}