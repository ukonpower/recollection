attribute float size;
attribute float num;

uniform float time;

varying vec2 vUv;
varying vec4 vPos;
varying float vSize;
varying vec3 vColor;

void main( void ) {

	vec3 pos = position;

	pos.y += sin( time + num ) * 0.05;
	pos.x += sin( time * 0.5 + num + 10.0 ) * 0.05;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

    vec2 alphaUV = vec2(512.0 + 70.0 , 512.0 + 50.0 );
    alphaUV /= 1024.0;
    alphaUV = vec2(alphaUV.x, 1.0 - alphaUV.y);

    vColor = vec3( 1.0 );
	
	gl_PointSize = 100.0 - gl_Position.z;

	vUv = uv;
	vPos = gl_Position;
	vSize = size;
}