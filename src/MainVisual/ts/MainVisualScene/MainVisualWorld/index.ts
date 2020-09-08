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

		// let ground = this.scene.getObjectByName( 'Ground' ) as THREE.Mesh;
		// ground.material = new THREE.ShaderMaterial( {
		// 	vertexShader: basicVert,
		// 	fragmentShader: basicFrag,
		// 	uniforms: this.commonUniforms
		// } );

	}

}
