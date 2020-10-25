import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import thumbnailVert from './shaders/thumbnail.vs';
import thumbnailFrag from './shaders/thumbnail.fs';

export class Thumbnail {

	private root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;

	constructor( root: THREE.Object3D, parentUniforms?: ORE.Uniforms ) {

		this.root = root;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.init();

	}

	protected init() {

		let material = new THREE.ShaderMaterial( {
			vertexShader: thumbnailVert,
			fragmentShader: thumbnailFrag,
			uniforms: this.commonUniforms,
			transparent: true
		} );

		let size = 4.0;
		this.root.add( new THREE.Mesh( new THREE.PlaneBufferGeometry( 1 * size, ( 9 / 16 ) * size ), material ) );

	}

}
