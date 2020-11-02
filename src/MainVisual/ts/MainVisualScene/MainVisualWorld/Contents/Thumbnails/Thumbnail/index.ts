import * as THREE from 'three';
import * as ORE from '@ore-three-ts';
import { GLContent } from '../..';
import thumbnailVert from './shaders/thumbnail.vs';
import thumbnailFrag from './shaders/thumbnail.fs';

export class Thumbnail extends THREE.Mesh {

	private commonUniforms: ORE.Uniforms;

	constructor( id: number, glLists: GLContent[], parentUniforms?: ORE.Uniforms ) {

		let uni = Object.assign( parentUniforms, {
			tex: window.mainVisualManager.assetManager.textures[ glLists[ id ].name ]
		} );

		let mat = new THREE.ShaderMaterial( {
			vertexShader: thumbnailVert,
			fragmentShader: thumbnailFrag,
			uniforms: uni,
			transparent: true
		} );

		super( new THREE.PlaneBufferGeometry( 1.0, 1.0 * 9 / 16, 100, 100 ), mat );

		this.init();

	}

	protected init() {

	}

}
