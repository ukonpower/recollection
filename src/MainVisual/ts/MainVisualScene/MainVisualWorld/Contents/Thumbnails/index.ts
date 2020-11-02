import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLList } from '..';
import { Thumbnail } from './Thumbnail';

export class Thumbnails {

	private glList: GLList;
	private thumbnails: Thumbnail[] = [];

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;
	private container: THREE.Object3D

	constructor( glList: GLList, scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.glList = glList;
		this.scene = scene;

		this.container = this.scene.getObjectByName( 'Thumbnails' );

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {
		}, parentUniforms );

		this.init();

	}

	protected init() {

		for ( let i = 0; i < this.glList.length; i ++ ) {

			let thumb = new Thumbnail( i, this.glList, this.commonUniforms );
			this.container.add( thumb );
			this.thumbnails.push( thumb );

		}

	}

}
