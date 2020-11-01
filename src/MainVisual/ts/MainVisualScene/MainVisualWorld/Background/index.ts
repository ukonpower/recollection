import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import backgroundVert from './shaders/background.vs';
import backgroundFrag from './shaders/background.fs';

export class Background extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( parentUniforms?: ORE.Uniforms ) {

		let uni = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		let geo = new THREE.PlaneBufferGeometry( 2.0, 2.0 );
		let mat = new THREE.ShaderMaterial( {
			vertexShader: backgroundVert,
			fragmentShader: backgroundFrag,
			uniforms: uni,
			depthTest: false,
			depthWrite: false,
		} );

		super( geo, mat );

		this.customDepthMaterial = new THREE.ShaderMaterial( {
			vertexShader: backgroundVert,
			fragmentShader: THREE.ShaderLib.depth.fragmentShader,
			defines: {
				'DEPTH_PACKING': THREE.RGBADepthPacking,
			}
		} );

		this.renderOrder = - 999;

		this.commonUniforms = uni;

	}

}
