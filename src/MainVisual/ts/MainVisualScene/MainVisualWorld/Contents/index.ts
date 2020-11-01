import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class Contents {

	private scene: THREE.Scene;
	private commonUniforms: ORE.Uniforms;

	constructor( scene: THREE.Scene, parentUniforms?: ORE.Uniforms ) {

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		this.init();

	}

	protected init() {

	}

}
