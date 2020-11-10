import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import particlesVert from './shaders/particles.vs';
import particlesFrag from './shaders/particles.fs';

export class Particles extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let size = 0.1;
		let range = new THREE.Vector3( 10, 5.0, 10 );

		let originGeo = new THREE.PlaneBufferGeometry( size, size );

		let geo = new THREE.InstancedBufferGeometry();
		geo.setAttribute( 'position', originGeo.getAttribute( 'position' ) );
		geo.setAttribute( 'uv', originGeo.getAttribute( 'uv' ) );
		geo.setIndex( originGeo.getIndex() );

		let num = 70;
		let offsetPosArray: number[] = [];
		let numArray: number[] = [];

		for ( let i = 0; i < num; i ++ ) {

			offsetPosArray.push(
				Math.random() * range.x,
				Math.random() * range.y,
				Math.random() * range.z,
			);

			numArray.push( i );

		}

		geo.setAttribute( 'offsetPos', new THREE.InstancedBufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'num', new THREE.InstancedBufferAttribute( new Float32Array( numArray ), 1 ) );

		let uni = ORE.UniformsLib.CopyUniforms( {
			range: {
				value: range
			}
		}, parentUniforms );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: particlesVert,
			fragmentShader: particlesFrag,
			uniforms: uni,
			depthWrite: false,
			depthTest: false,
			transparent: true
		} );

		super( geo, mat );
		this.renderOrder = 999;

		this.commonUniforms = uni;

	}

}
