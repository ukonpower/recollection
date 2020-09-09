import * as THREE from 'three';
import * as ORE from 'ore-three-ts';

import basicVert from './shaders/basic.vs';
import basicFrag from './shaders/basic.fs';

export class MainVisualWorld {

	private animator: ORE.Animator;

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	constructor( scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		let light = new THREE.DirectionalLight();
		light.position.set( 0, 2, 3 );
		light.intensity = 2.0;
		this.scene.add( light );

	}

}
