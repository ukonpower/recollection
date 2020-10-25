import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { Thumbnail } from './Thumbnail';

export class Thumbnails {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private base: THREE.Object3D;
	private h: Thumbnail;
	private s: Thumbnail;

	constructor( scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.init();

	}

	protected init() {

		this.base = this.scene.getObjectByName( 'ContentsThumbnails' );
		this.s = new Thumbnail( this.base.getObjectByName( 'ContentsThumbnail_S' ), this.commonUniforms );
		this.h = new Thumbnail( this.base.getObjectByName( 'ContentsThumbnail_H' ), this.commonUniforms );

	}

}
