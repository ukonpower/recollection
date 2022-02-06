import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import particlesVert from './shaders/particles.vs';
import particlesFrag from './shaders/particles.fs';

export class Particles extends THREE.Points {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let range = new THREE.Vector3( 1.2, 1.2, 1.0 );

		let num = 200;
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

		let geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( offsetPosArray ), 3 ) );
		geo.setAttribute( 'num', new THREE.BufferAttribute( new Float32Array( numArray ), 1 ) );

		let uni = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			range: {
				value: range
			},
			particleSize: {
				value: 1.0
			}
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: particlesVert,
			fragmentShader: particlesFrag,
			uniforms: uni,
			transparent: true,
			blending: THREE.AdditiveBlending,
		} );

		super( geo, mat );

		this.commonUniforms = uni;

	}

	public resize( layerInfo: ORE.LayerInfo ) {

		this.commonUniforms.particleSize.value = layerInfo.size.windowSize.y / 50;

	}

}
