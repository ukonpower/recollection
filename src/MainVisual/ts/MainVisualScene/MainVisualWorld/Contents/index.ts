import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { Thumbnails } from './Thumbnails';

export class Contents {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	private thumbnails: Thumbnails;

	constructor( scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.init();

	}

	protected init() {

		this.thumbnails = new Thumbnails( this.scene, this.commonUniforms );

	}

}
