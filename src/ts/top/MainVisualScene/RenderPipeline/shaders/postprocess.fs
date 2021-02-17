uniform sampler2D backbuffer;
uniform vec2 resolution;
varying vec2 vUv;

uniform float time;

#pragma glslify: random = require('./random.glsl' )

void main(){

	vec4 tex = texture2D( backbuffer, vUv );

	gl_FragColor = tex;
	
}